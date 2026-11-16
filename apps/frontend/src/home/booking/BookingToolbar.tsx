import { CalendarDays, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw } from "lucide-react";
import { formatDate } from "./bookingHelpers";
import { CustomSelect, type CustomSelectOption } from "./CustomSelect";
import type { Visit } from "./bookingApi";
import type { CalendarDay } from "./WeekCalendar";

const STATUS_FILTER_OPTIONS: CustomSelectOption<string>[] = [
  { value: "all", label: "All Visits" },
  { value: "confirmed", label: "Confirmed", dotColor: "bg-emerald-500" },
  { value: "pending", label: "Pending", dotColor: "bg-amber-500" },
  { value: "cancelled", label: "Cancelled", dotColor: "bg-rose-500" },
];

type BookingToolbarProps = {
  visits: Visit[];
  days: CalendarDay[];
  week: Date;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

export function BookingToolbar({
  visits,
  days,
  week,
  statusFilter,
  onStatusChange,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: BookingToolbarProps) {
  const agentCount = new Set(visits.map((visit) => visit.userId)).size;

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs font-semibold text-blue-700 shadow-2xs">
            <CalendarDays size={14} className="text-blue-600" />
            <span>All Agents</span>
            <span className="rounded-full bg-blue-200/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
              {agentCount}
            </span>
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={STATUS_FILTER_OPTIONS}
            prefix="Filter:"
            icon={<SlidersHorizontal size={14} className="text-slate-500" />}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Previous week"
            onClick={onPreviousWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[170px] text-center text-xs font-semibold text-slate-700">
            {formatDate(week)} – {formatDate(days[6]?.date ?? week)}
          </span>

          <button
            type="button"
            title="Next week"
            onClick={onNextWeek}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="ml-1.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          >
            <RotateCcw size={12} />
            Today
          </button>
        </div>
      </div>
    </section>
  );
}
