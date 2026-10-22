import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAvailabilityDto } from '../dtos/availability.dto';

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
}