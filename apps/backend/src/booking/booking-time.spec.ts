import { dayBounds, localTime } from './booking-time';

describe('booking time', () => {
  it('uses a local day rather than a UTC day', () => {
    const day = dayBounds('2026-11-10', 'America/New_York');
    expect(day.start.toISOString()).toBe('2026-11-10T05:00:00.000Z');
    expect(day.end.toISOString()).toBe('2026-11-11T05:00:00.000Z');
  });

  it('handles a daylight-saving day that is not 24 hours', () => {
    const day = dayBounds('2026-03-08', 'America/New_York');
    expect(day.end.getTime() - day.start.getTime()).toBe(23 * 60 * 60 * 1000);
  });

  it('rejects invalid dates and times', () => {
    expect(() => dayBounds('2026-02-30', 'UTC')).toThrow();
    expect(() => localTime('2026-11-10', '25:00', 'UTC')).toThrow();
  });
});
