import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetWeeklyAvailabilityDto } from '../dtos/GetWeeklyRules.dto';
import { CreateCalendarExceptionDto } from '../dtos/CalendarException.Dto'

@Injectable()
export class GetWeeklyRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeeklyRules(userId: string) {
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

  async setWeeklyRules(dto: SetWeeklyAvailabilityDto) {
    const { userId, slotDuration, rules } = dto;

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

  async getCalendarExceptions(userId: string) {
    return await this.prisma.calendarException.findMany({
      where: { userId },
      orderBy: { date: 'asc' } as any,
    });
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
  async deleteException(id: string)
  {
    const exception = await this.prisma.calendarException.findMany({
      where: { id },
    });
    if (!exception)
      throw new NotFoundException(`Calendar exception with ID ${id} not found.`);
    await this.prisma.calendarException.delete({where: {id}});
    return {success: true, message: 'Calendar exception deleted successfully.'};
  }
}