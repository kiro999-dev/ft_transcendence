import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetWeeklyAvailabilityDto } from '../dtos/GetWeeklyRules.dto';
import { CreateCalendarExceptionDto } from '../dtos/CalendarException.Dto'
import { dayBounds, localTime } from './booking-time';

type Caller = { sub: string; organizationId: string; role: string };

@Injectable()
export class GetWeeklyRulesService {
  constructor(private readonly prisma: PrismaService) {}

  // Owners can manage their agency; other users can manage only themselves.
  private async checkAgent(userId: string, caller: Caller) {
    if (!caller?.sub || !caller.organizationId) throw new ForbiddenException('Organization is required');
    const agent = await this.prisma.users.findFirst({ where: { id: userId, organization_id: caller.organizationId } });
    if (!agent) throw new NotFoundException('Agent not found');
    if (caller.sub !== userId && caller.role !== 'owner') throw new ForbiddenException('Not allowed to manage this agent');
  }

  async getWeeklyRules(userId: string, caller: Caller) {
    await this.checkAgent(userId, caller);
    const rules = await this.prisma.weeklyAvailability.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' },
    });

    if (!rules || rules.length === 0) {
      return {
        userId,
        slotDuration: 30,
        isDefault: true,
        rules: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
        ],
      };
    }

    return {
      userId,
      slotDuration: rules[0]?.slotDuration || 30,
      isDefault: false,
      rules: rules.map((r: { dayOfWeek: number; startTime: string; endTime: string }) => ({
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
      })),
    };
  }

  async setWeeklyRules(dto: SetWeeklyAvailabilityDto, caller: Caller) {
    const { userId, slotDuration, rules } = dto;
    await this.checkAgent(userId, caller);
    for (const rule of rules) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.startTime) ||
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.endTime) || rule.startTime >= rule.endTime) {
        throw new BadRequestException('Use valid start and end times, with start before end');
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      // Use camelCase `weeklyAvailability`
      await tx.weeklyAvailability.deleteMany({
        where: { userId },
      });

      if (rules.length > 0) {
        await tx.weeklyAvailability.createMany({
          data: rules.map((rule) => ({
            userId,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            slotDuration,
          })),
        });
      }

      return { success: true, message: 'Weekly availability updated successfully.' };
    });
  }

  async getCalendarExceptions(userId: string, caller: Caller) {
    await this.checkAgent(userId, caller);
    return this.prisma.calendarException.findMany({ where: { userId }, orderBy: { startTime: 'asc' } });
  }
  async createException(dto: CreateCalendarExceptionDto)
  {
    const { userId, date, isUnavailable, startTime, endTime, reason } = dto
    // return await this.prisma.calendarException.create({
    //   data:{
    //     userId,
    //     // date: new Date(date),
    //     // isUnavailable,
    //     // startTime: isUnavailable ? null : startTime,
    //     // endTime: isUnavailable ? null : endTime,
    //     reason,
    //   },
    // });
  }

  async deleteException(id: string, caller: Caller) {
    const exception = await this.prisma.calendarException.findUnique({ where: { id } });
    if (!exception) throw new NotFoundException('Calendar exception not found');
    await this.checkAgent(exception.userId, caller);
    await this.prisma.calendarException.delete({ where: { id } });
    return { success: true, message: 'Calendar exception deleted successfully.' };
  }
}
