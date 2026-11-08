import { BadRequestException } from '@nestjs/common';
import { Temporal } from '@js-temporal/polyfill';

// Turn a local calendar day into the exact UTC interval for that time zone.
export function dayBounds(date: string, timezone: string) {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
    const day = Temporal.PlainDate.from(date);
    const start = day.toZonedDateTime({ timeZone: timezone, plainTime: '00:00' });
    const end = day.add({ days: 1 }).toZonedDateTime({ timeZone: timezone, plainTime: '00:00' });
    return { start: new Date(start.epochMilliseconds), end: new Date(end.epochMilliseconds) };
  } catch {
    throw new BadRequestException('Invalid date or timezone');
  }
}

export function localTime(date: string, time: string, timezone: string) {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid date or time');
    const day = Temporal.PlainDate.from(date);
    const zoned = day.toPlainDateTime(Temporal.PlainTime.from(time)).toZonedDateTime(timezone, { disambiguation: 'reject' });
    return new Date(zoned.epochMilliseconds);
  } catch {
    throw new BadRequestException('Invalid date, time or timezone');
  }
}
