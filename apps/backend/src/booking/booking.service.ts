import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAvailabilityDto } from '../dtos/availability.dto';
import { VisitDto } from '../dtos/visit.dto';
import { RescheduleVisitDto } from '../dtos/rescheduleVisit.dto';
import { start } from 'repl';

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

    const startOfDay = new Date(`${data.preferred_date}T00:00:00.000Z`);
    const endOfDay = new Date(`${data.preferred_date}T23:59:59.999Z`);

    const agentAvailability = await this.prisma.agentAvailability.findMany({
      where: {
        userId: agent.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const exceptionSlots = await this.prisma.calendarException.findMany({
      where: {
        userId: agent.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const isvisit = await this.prisma.visit.findMany({
      where: {
        userId: agent.id,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
    });

    const availableSlots: {
      starts_at: string;
      ends_at: string;
      agent_id: string;
      agent_name: string;
    }[] = [];

    for (let i = 0; i < agentAvailability.length; i++) {
      const slot = agentAvailability[i];

      const exception = exceptionSlots.find(
        (exc: { startTime: Date; endTime: Date }) =>
          slot.startTime < exc.endTime && slot.endTime > exc.startTime,
      );
      if (exception) {
        continue;
      }

      const visit = isvisit.find(
        (vis: { startAt: Date; endAt: Date }) =>
          slot.startTime < vis.endAt && slot.endTime > vis.startAt,
      );
      if (visit) {
        continue;
      }

      availableSlots.push({
        starts_at: slot.startTime.toISOString(),
        ends_at: slot.endTime.toISOString(),
        agent_id: agent.id,
        agent_name: `${agent.first_name} ${agent.last_name}`,
      });
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
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    return await this.prisma.$transaction(async (tx) => {
        const  check_availibility = await tx.agentAvailability.findFirst({
          where: {
            userId: dto.agent_id,
            startTime: {
              lte: startsAt,
            },
            endTime: {
              gte: endsAt,
            },
          },
        });
        if (!check_availibility) {
          throw new ConflictException({
            error: 'SLOT_UNAVAILABLE',
            message: 'This time slot is no longer available.',
          });
        }
        const check_exception = await tx.calendarException.findFirst({
          where: {
            userId: dto.agent_id,
            startTime: {
              lt: startsAt,
            },
            endTime: {
              gt: endsAt,
            },
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
          status: { not: 'cancelled' }
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
    return this.prisma.visit.findMany({
      include: {
        lead: true,
        property: true,
        user: true,
      },
    });
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
          status: { not: 'cancelled' },
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
      include: {
        lead: true,
        property: true,
        user: true,
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
      include: {
        lead: true,
        property: true,
        user: true,
      },
    });
  }
}