import { DAY_NAMES, CALENDAR_COLUMNS, HOURS, formatTime, dateKey } from "./bookingHelpers";
import type { Visit } from "./bookingApi";

export type CalendarDay = {
  date: Date;
  key: string;
  visits: Visit[];
};

type WeekCalendarProps = {
  days: CalendarDay[];
  statusFilter: string;
  selectedDate: string;
  onSelectDate: (key: string) => void;
  onSelectVisit: (visit: Visit) => void;
};

export function WeekCalendar({
  days,
  statusFilter,
  selectedDate,
  onSelectDate,
  onSelectVisit,
}: WeekCalendarProps) {
  const todayKey = dateKey(new Date());

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[792px]">
        <div
          className="grid border-b border-slate-200 bg-slate-50"
          style={{ gridTemplateColumns: CALENDAR_COLUMNS }}
        >
          <div />
          {days.map((day) => {
            const isToday = day.key === todayKey;
            const isSelected = selectedDate === day.key;

            return (
              <button
                type="button"
                key={day.key}
                onClick={() => onSelectDate(day.key)}
                className={`border-l border-slate-200 px-2 py-2.5 text-center transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : isToday
                    ? "bg-blue-50/40 text-slate-800 hover:bg-slate-100"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <p className={`text-[10px] font-semibold uppercase ${isToday ? "text-blue-600 font-bold" : ""}`}>
                    {DAY_NAMES[day.date.getDay()].slice(0, 3)}
                  </p>
                  {isToday && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-blue-700">
                      Today
                    </span>
                  )}
                </div>
                <p className={`text-sm font-bold ${isToday ? "text-blue-700 font-extrabold" : ""}`}>
                  {day.date.getDate()}
                </p>
              </button>
            );
          })}
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: CALENDAR_COLUMNS }}
        >
          <div className="bg-slate-50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-14 border-b border-r border-slate-100 pt-2 text-center text-[10px] text-slate-400"
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          <div className="col-span-7 grid grid-cols-7">
            {days.map((day) => (
              <div key={day.key} className="relative border-r border-slate-100">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-14 border-b border-slate-100" />
                ))}

                {day.visits
                  .filter(
                    (visit) =>
                      statusFilter === "all" ||
                      visit.status.toLowerCase() === statusFilter,
                  )
                  .map((visit) => {
                    const visitDate = new Date(visit.startAt);
                    const top =
                      (visitDate.getHours() - 8) * 56 +
                      visitDate.getMinutes() * 0.93;

                    return (
                      <button
                        type="button"
                        key={visit.id}
                        onClick={() => onSelectVisit(visit)}
                        className="absolute left-1 right-1 rounded-md border border-blue-200 bg-blue-50 p-2 text-left text-[10px] shadow-sm transition hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ top: `${Math.max(0, top)}px` }}
                      >
                        <b className="uppercase text-blue-700">{visit.status}</b>
                        <span className="mt-1 block truncate font-semibold">
                          {visit.property_id.slice(0, 8)}...
                        </span>
                        <span className="block text-slate-500">
                          {formatTime(visit.startAt)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
