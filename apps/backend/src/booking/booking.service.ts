import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { VisitDto } from '../dtos/visit.dto';
import { RescheduleVisitDto } from '../dtos/rescheduleVisit.dto';
import { Temporal } from '@js-temporal/polyfill';
import { dayBounds, localTime } from './booking-time';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(data: GetAvailabilityDto) {
    const property = await this.prisma.properties.findUnique({
      where: {
        id: data.property_id,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${data.property_id} not found`);
    }

    const agent = await this.prisma.users.findFirst({
      where: {
        organization_id: property.organization_id,
        role: 'owner',
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found for property');
    }

    const zone = data.timezone || 'Africa/Casablanca';
    const bounds = dayBounds(data.preferred_date, zone);

    const plainDate = Temporal.PlainDate.from(data.preferred_date);
    const dayOfWeek = plainDate.dayOfWeek % 7; 
    const today = Temporal.Now.plainDateISO(zone);
    if (Temporal.PlainDate.compare(plainDate, today) < 0) {
      throw new BadRequestException('Cannot query availability for a past date');
    }
    const rules = await this.prisma.weeklyAvailability.findMany({
      where: {
        userId: agent.id,
        dayOfWeek: dayOfWeek,
      },
    });

    if (!rules || rules.length === 0) {
      throw new NotFoundException('No availability found for the agent on the specified date');
    }

    const exceptionSlots = await this.prisma.calendarException.findMany({
      where: {
        userId: agent.id,
        startTime: { lt: bounds.end },
        endTime: { gt: bounds.start },
      },
    });

    const isvisit = await this.prisma.visit.findMany({
      where: {
        userId: agent.id,
        startAt: { lt: bounds.end },
        endAt: { gt: bounds.start },
        status: { notIn: ['CANCELLED', 'cancelled'] },
      },
    });

    const availableSlots: {
      starts_at: string;
      ends_at: string;
      agent_id: string;
      agent_name: string;
    }[] = [];

    const nowZone = Temporal.Now.zonedDateTimeISO(zone);
const nowMs = nowZone.epochMilliseconds;

for (const rule of rules) {
  const slotDuration = data.duration_minutes || rule.slotDuration || 30;
  const ruleStart = localTime(data.preferred_date, rule.startTime, zone);
  const ruleEnd = localTime(data.preferred_date, rule.endTime, zone);

  let currentStart = new Date(ruleStart.getTime());

  while (currentStart.getTime() + slotDuration * 60 * 1000 <= ruleEnd.getTime())
  {
    const currentEnd = new Date(currentStart.getTime() + slotDuration * 60 * 1000);

    if (currentStart.getTime() < nowMs) {
      currentStart = currentEnd;
      continue;
    }

    const hasException = exceptionSlots.some(
      (exc) => currentStart < exc.endTime && currentEnd > exc.startTime,
    );

    const hasVisit = isvisit.some(
      (vis) => currentStart < vis.endAt && currentEnd > vis.startAt,
    );

    if (!hasException && !hasVisit) {
      availableSlots.push({
        starts_at: currentStart.toISOString(),
        ends_at: currentEnd.toISOString(),
        agent_id: agent.id,
        agent_name: `${agent.first_name || ''} ${agent.last_name || ''}`.trim(),
      });
    }

    currentStart = currentEnd;
  }
}

    return {
      property_id: data.property_id,
      date: data.preferred_date,
      slots: availableSlots,
    };
  }

  async createVisitFromAI(dto: VisitDto, organizationId: string) {
    const check_organization = await this.prisma.properties.findFirst({
      where: {
        id: dto.property_id,
        organization_id: organizationId,
      },
    });
    if (!check_organization) {
      throw new NotFoundException('Organization not found for the given property and agent');
    }
    const check_agent = await this.prisma.users.findFirst({
      where: {
        id: dto.agent_id,
        organization_id: organizationId,
      },
    });
    if (!check_agent) {
      throw new NotFoundException('Agent not found for the given agent ID and organization');
    }
    const check_lead_id = await this.prisma.leads.findFirst({
      where: {
        id: dto.lead_id,
        organization_id: organizationId,
      },
    });
    if (!check_lead_id) {
      throw new NotFoundException('Lead not found for the given lead ID and organization');
    }
    const check_contact_id = await this.prisma.visitors.findFirst({
      where: {
        id: dto.contact_id,
        organization_id: organizationId,
      },
    });
    if (!check_contact_id) {
      throw new NotFoundException('Contact not found for the given contact ID and organization');
    }

    const startsAt = new Date(dto.starts_at);
    const duration = dto.duration_minutes || 30;
    const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);

    const dateStr = dto.starts_at.split('T')[0];
    const plainDate = Temporal.PlainDate.from(dateStr);
    const dayOfWeek = plainDate.dayOfWeek % 7;

    return await this.prisma.$transaction(async (tx) => {
      const weeklyRules = await tx.weeklyAvailability.findMany({
        where: {
          userId: dto.agent_id,
          dayOfWeek: dayOfWeek,
        },
      });

      if (!weeklyRules || weeklyRules.length === 0) {
        throw new ConflictException({
          error: 'SLOT_UNAVAILABLE',
          message: 'This time slot is no longer available.',
        });
      }

      const check_exception = await tx.calendarException.findFirst({
        where: {
          userId: dto.agent_id,
          startTime: { lt: startsAt },
          endTime: { gt: endsAt },
        },
      });

      if (check_exception) {
        throw new ConflictException({
          error: 'SLOT_UNAVAILABLE',
          message: 'This time slot is no longer available.',
        });
      }

      const existingVisit = await tx.visit.findFirst({
        where: {
          property_id: dto.property_id,
          userId: dto.agent_id,
          startAt: { lt: endsAt },
          endAt: { gt: startsAt },
          status: { notIn: ['CANCELLED', 'cancelled'] },
        },
      });

      if (existingVisit) {
        throw new ConflictException({
          error: 'SLOT_UNAVAILABLE',
          message: 'This time slot is no longer available.',
        });
      }

      const createdVisit = await tx.visit.create({
        data: {
          leadId: dto.lead_id,
          property_id: dto.property_id,
          userId: dto.agent_id,
          date_of_visit: startsAt,
          startAt: startsAt,
          endAt: endsAt,
          status: 'confirmed',
        },
      });

      await tx.visitStatusHistory.create({
        data: {
          visitId: createdVisit.id,
          status: 'confirmed',
        },
      });

      return {
        visit_id: createdVisit.id,
        status: createdVisit.status,
        property_id: createdVisit.property_id,
        agent: {
          id: check_agent.id,
          name: `${check_agent.first_name} ${check_agent.last_name}`,
        },
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      };
    });
  }

  async getVisits() {
    return this.prisma.visit.findMany({});
  }

  async rescheduleVisit(id: string, startsAt: string) {
    const check_id = await this.prisma.visit.findUnique({ where: { id } });
    if (!check_id) {
      throw new NotFoundException('Visit not found for the given ID');
    }
    const startDate = new Date(startsAt);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const existingConflict = await this.prisma.visit.findFirst({
      where: {
        id: { not: id },
        status: { notIn: ['CANCELLED', 'cancelled'] },
        OR: [
          { userId: check_id.userId },
          { property_id: check_id.property_id },
        ],
        AND: [
          { startAt: { lt: endDate } },
          { endAt: { gt: startDate } },
        ],
      },
    });
    if (existingConflict) {
      throw new ConflictException({
        error: 'SLOT_UNAVAILABLE',
        message: 'This time slot is no longer available.',
      });
    }
    return this.prisma.visit.update({
      where: { id },
      data: {
        startAt: startDate,
        endAt: endDate,
        date_of_visit: startDate,
        status: 'confirmed',
      },
    });
  }

  async cancelVisit(id: string) {
    const check_id = await this.prisma.visit.findUnique({ where: { id } });
    if (!check_id) {
      throw new NotFoundException('Visit not found for the given ID');
    }
    if (check_id.status === 'cancelled') {
      throw new BadRequestException('Visit is already cancelled');
    }
    return this.prisma.visit.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });
  }
}