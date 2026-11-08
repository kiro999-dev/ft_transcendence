import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { dayBounds } from './booking-time';
import { VisitDto } from '../dtos/visit.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) { }
  async getAvailability(data: GetAvailabilityDto, organizationId: string) {
    if (!organizationId) {
      throw new NotFoundException('Property not found');
    }

    const property = await this.prisma.properties.findFirst({
      where: {
        id: data.property_id,
        organization_id: organizationId,
        status: 'available',
      }
    })

    if (!property) {
      throw new NotFoundException(`Property with ID ${data.property_id} not found`);
    }
    const agent = await prisma.users.findFirst({
      where: {
        organization_id: property.organization_id,
        role: 'owner'
      }
    })
    if (!agent) {
      throw new NotFoundException('Agent not found for property')
    }
    const { start: startOfDay, end: endOfDay } = dayBounds(data.preferred_date, data.timezone || 'Africa/Casablanca');
    const agentAvailability = await this.prisma.agentAvailability.findMany({
      where: {
        userId: agent.id,
        startTime: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })
    const exceptionSlots = await prisma.CalendarException.findMany({
      where: {
        userId: agent.id,
        startTime: { lt: endOfDay },
        endTime: { gt: startOfDay },
      }
    })
    const isvisit = await prisma.Visit.findMany({
      where: {
        userId: agent.id,
        startAt: { lt: endOfDay },
        endAt: { gt: startOfDay },
        status: { notIn: ['CANCELLED', 'cancelled'] }
      }
    })
    const availableSlots: {
      starts_at: string;
      ends_at: string;
      agent_id: string;
      agent_name: string;
    }[] = [];

    for (let i = 0; i < agentAvailability.length; i++) {
      const slot = agentAvailability[i]
      const exception = exceptionSlots.find((exc: any) =>
        slot.startTime < exc.endTime && slot.endTime > exc.startTime
      )
      if (exception) {
        continue
      }
      const visit = isvisit.find((vis: any) =>
        slot.startTime < vis.endAt && slot.endTime > vis.startAt
      )
      if (visit) {
        continue
      }
      availableSlots.push({
        starts_at: slot.startTime.toISOString(),
        ends_at: slot.endTime.toISOString(),
        agent_id: agent.id,
        agent_name: `${agent.first_name} ${agent.last_name}`
      })

    }
    return {
      property_id: data.property_id,
      date: data.preferred_date,
      slots: availableSlots
    };


  }

  async createVisit(data: VisitDto, organizationId: string) {
    if (!organizationId) throw new NotFoundException('Property not found');
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(data.starts_at)) {
      throw new BadRequestException('starts_at must include a timezone');
    }
    const startsAt = new Date(data.starts_at);
    if (Number.isNaN(startsAt.getTime())) throw new BadRequestException('Invalid start time');
    if (startsAt <= new Date()) throw new BadRequestException('Visit must be in the future');

    return this.prisma.$transaction(async (tx) => {
      // Serialize booking requests for the same agent inside PostgreSQL.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${data.agent_id}))::text`;
      const property = await tx.properties.findFirst({ where: {
        id: data.property_id, organization_id: organizationId, status: 'available',
      }});
      if (!property) throw new NotFoundException('Available property not found');
      const agent = await tx.users.findFirst({ where: {
        id: data.agent_id, organization_id: organizationId, role: 'owner',
      }});
      if (!agent) throw new NotFoundException('Agent not found');
      const lead = await tx.leads.findFirst({ where: {
        id: data.lead_id, organization_id: organizationId, visitor_id: data.contact_id,
      }});
      if (!lead) throw new NotFoundException('Lead or contact not found');

      // Accept only a slot that the backend itself offered for this agent.
      const slot = await tx.agentAvailability.findFirst({ where: { userId: agent.id, startTime: startsAt } });
      if (!slot || slot.endTime <= startsAt) throw new ConflictException({ error: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available.' });
      const blocked = await tx.calendarException.findFirst({ where: {
        userId: agent.id, startTime: { lt: slot.endTime }, endTime: { gt: startsAt },
      }});
      const visit = await tx.visit.findFirst({ where: {
        userId: agent.id, startAt: { lt: slot.endTime }, endAt: { gt: startsAt }, status: { notIn: ['CANCELLED', 'cancelled'] },
      }});
      if (blocked || visit) throw new ConflictException({ error: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available.' });

      const created = await tx.visit.create({ data: {
        userId: agent.id, property_id: property.id, leadId: lead.id,
        date_of_visit: startsAt, startAt: startsAt, endAt: slot.endTime, status: 'CONFIRMED',
      }});
      await tx.visitStatusHistory.create({ data: { visitId: created.id, status: 'CONFIRMED' } });
      const notes = data.customer_notes?.trim();
      await tx.leads.update({ where: { id: lead.id }, data: {
        status: 'Visit Scheduled', property_id: property.id,
        ...(notes ? { notes: [lead.notes, `Visit: ${notes}`].filter(Boolean).join('\n') } : {}),
      }});
      return {
        visit_id: created.id, status: 'confirmed', property_id: property.id,
        agent: { id: agent.id, name: `${agent.first_name} ${agent.last_name}` },
        starts_at: created.startAt.toISOString(), ends_at: created.endAt.toISOString(),
      };
    });
  }


  async getVisits(organizationId: string) {
    if (!organizationId) throw new NotFoundException('Organization not found');
    return this.prisma.visit.findMany({
      where: { property: { organization_id: organizationId } },
      include: {
        lead: true,
        property: true,
        // Never return the user's password or tokens.
        user: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async rescheduleVisit(id: string, startsAt: string, caller: { sub: string; organizationId: string; role: string }) {
    if (!caller?.organizationId) throw new NotFoundException('Visit not found');
    const current = await this.prisma.visit.findFirst({ where: { id, property: { organization_id: caller.organizationId } } });
    if (!current) throw new NotFoundException('Visit not found');
    if (caller.role !== 'owner' && caller.sub !== current.userId) throw new ForbiddenException('Not allowed to manage this visit');
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(startsAt)) throw new BadRequestException('starts_at must include a timezone');
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start <= new Date()) throw new BadRequestException('Visit must be in the future');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${current.userId}))::text`;
      const visit = await tx.visit.findFirst({ where: { id, property: { organization_id: caller.organizationId } } });
      if (!visit) throw new NotFoundException('Visit not found');
      if (visit.status.toUpperCase() === 'CANCELLED') throw new BadRequestException('Cancelled visits cannot be rescheduled');
      const slot = await tx.agentAvailability.findFirst({ where: { userId: visit.userId, startTime: start } });
      if (!slot || slot.endTime <= start) throw new ConflictException({ error: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available.' });
      const blocked = await tx.calendarException.findFirst({ where: { userId: visit.userId, startTime: { lt: slot.endTime }, endTime: { gt: start } } });
      const conflict = await tx.visit.findFirst({ where: { id: { not: id }, userId: visit.userId,
        startAt: { lt: slot.endTime }, endAt: { gt: start }, status: { notIn: ['CANCELLED', 'cancelled'] } } });
      if (blocked || conflict) throw new ConflictException({ error: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available.' });
      const updated = await tx.visit.update({ where: { id }, data: { startAt: start, endAt: slot.endTime, date_of_visit: start, status: 'CONFIRMED' } });
      await tx.visitStatusHistory.create({ data: { visitId: id, status: 'RESCHEDULED' } });
      return updated;
    });
  }

  async cancelVisit(id: string, caller: { sub: string; organizationId: string; role: string }) {
    if (!caller?.organizationId) throw new NotFoundException('Visit not found');
    const current = await this.prisma.visit.findFirst({ where: { id, property: { organization_id: caller.organizationId } } });
    if (!current) throw new NotFoundException('Visit not found');
    if (caller.role !== 'owner' && caller.sub !== current.userId) throw new ForbiddenException('Not allowed to manage this visit');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${current.userId}))::text`;
      const visit = await tx.visit.findFirst({ where: { id, property: { organization_id: caller.organizationId } } });
      if (!visit) throw new NotFoundException('Visit not found');
      if (visit.status.toUpperCase() === 'CANCELLED') throw new BadRequestException('Visit is already cancelled');
      const updated = await tx.visit.update({ where: { id }, data: { status: 'CANCELLED' } });
      await tx.visitStatusHistory.create({ data: { visitId: id, status: 'CANCELLED' } });
      return updated;
    });
  }

}
