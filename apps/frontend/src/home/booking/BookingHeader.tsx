import { Plus, RefreshCw } from "lucide-react";

type BookingHeaderProps = {
  loading: boolean;
  onRefresh: () => void;
  onNewVisit: () => void;
};

export function BookingHeader({ loading, onRefresh, onNewVisit }: BookingHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Scheduling &amp; Agent Dispatch</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600">Real-Time Visit Calendar</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Calendar &amp; Site Visits</h1>
        <p className="mt-1 text-xs text-slate-500">Autonomous scheduling matrix and private buyer site logistics.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm">Week</span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-blue-300 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Sync Calendar"}
        </button>
        <button
          type="button"
          onClick={onNewVisit}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-0"
        >
          <Plus size={15} /> Schedule New Visit
        </button>
      </div>
    </header>
  );
}
