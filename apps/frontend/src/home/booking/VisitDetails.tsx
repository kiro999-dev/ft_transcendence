import { useState } from "react";
import { X, CalendarClock, Ban, Loader2 } from "lucide-react";
import { formatDate, formatTime, isCancelled } from "./bookingHelpers";
import type { Visit } from "./bookingApi";

type VisitDetailsProps = {
  visit: Visit;
  busy: boolean;
  onClose: () => void;
  onCancel: () => void;
  onReschedule: (value: string) => void;
};

export function VisitDetails({
  visit,
  busy,
  onClose,
  onCancel,
  onReschedule,
}: VisitDetailsProps) {
  const [newDate, setNewDate] = useState("");

  const handleRescheduleSubmit = () => {
    if (!newDate) return;
    onReschedule(newDate);
    setNewDate("");
  };

  const cancelled = isCancelled(visit.status);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              cancelled
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {visit.status}
          </span>
          <h2 className="mt-3 text-base font-bold text-slate-900">Private Visit Details</h2>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(visit.startAt)} · {formatTime(visit.startAt)}
          </p>
        </div>

        <button
          type="button"
          title="Close details"
          onClick={onClose}
          className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-5 space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs">
        <p className="font-bold text-slate-800">Visit Identifiers</p>
        <div className="space-y-1 text-slate-600">
          <p className="flex justify-between">
            <span className="text-slate-400">Property:</span>
            <span className="font-mono font-medium text-slate-700">{visit.property_id.slice(0, 18)}...</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Client:</span>
            <span className="font-mono font-medium text-slate-700">{visit.leadId.slice(0, 18)}...</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-400">Agent:</span>
            <span className="font-mono font-medium text-slate-700">{visit.userId.slice(0, 18)}...</span>
          </p>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2.5">
            <div className="flex flex-col">
              <span className="mb-1 text-[11px] font-semibold text-slate-700">
                Reschedule Date &amp; Time
              </span>
              <div className="group relative flex items-center rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 shadow-2xs">
                <div className="pointer-events-none pl-3 text-slate-400 group-focus-within:text-blue-600">
                  <CalendarClock size={14} />
                </div>
                <input
                  type="datetime-local"
                  disabled={busy}
                  value={newDate}
                  onChange={(event) => setNewDate(event.target.value)}
                  className="w-full bg-transparent px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={busy || !newDate}
              onClick={handleRescheduleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CalendarClock size={14} />
                  Confirm Reschedule
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-semibold text-red-600 shadow-2xs transition-all hover:bg-red-100/80 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 size={13} className="animate-spin text-red-600" />
                Cancelling...
              </>
            ) : (
              <>
                <Ban size={14} />
                Cancel Visit
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
