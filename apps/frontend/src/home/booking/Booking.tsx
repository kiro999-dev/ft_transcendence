import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { cancelVisit, fetchVisits, rescheduleVisit } from "./bookingApi";
import type { Visit } from "./bookingApi";
import { dateKey, getTodayDate } from "./bookingHelpers";
import { BookingHeader } from "./BookingHeader";
import { BookingStats } from "./BookingStats";
import { BookingToolbar } from "./BookingToolbar";
import { CreateVisitModal } from "./CreateVisitModal";
import { InsightCard } from "./InsightCard";
import { VisitDetails } from "./VisitDetails";
import { WeekCalendar } from "./WeekCalendar";
import type { CalendarDay } from "./WeekCalendar";

export const Booking = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [week, setWeek] = useState(() => getTodayDate(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadVisits = async (showToast = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVisits();
      setVisits(data);
      if (showToast) {
        toast.success("Calendar updated", { position: "top-right", duration: 2500 });
      }
    } catch (loadError) {
      const msg = loadError instanceof Error ? loadError.message : "Unable to load visits";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadVisits(); }, []);

  const days = useMemo<CalendarDay[]>(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(week);
    date.setDate(week.getDate() + index);
    const key = dateKey(date);
    return { date, key, visits: visits.filter((visit) => visit.startAt.slice(0, 10) === key) };
  }), [visits, week]);

  const filteredVisits = visits.filter((visit) => statusFilter === "all" || visit.status.toLowerCase() === statusFilter);
  const moveWeek = (amount: number) => { const nextWeek = new Date(week); nextWeek.setDate(nextWeek.getDate() + amount * 7); setWeek(nextWeek); setSelectedDate(dateKey(nextWeek)); };
  const goToToday = () => { const today = new Date(); setWeek(getTodayDate(today)); setSelectedDate(dateKey(today)); };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this visit?")) return;
    setBusy(true);
    try {
      await cancelVisit(id);
      toast.success("Visit cancelled successfully", {
        position: "top-right",
        duration: 3000,
        style: {
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0",
          fontSize: "13px",
          fontWeight: 600,
        },
      });
      await loadVisits();
      setSelectedVisit(null);
    } catch (cancelError) {
      const msg = cancelError instanceof Error ? cancelError.message : "Unable to cancel visit";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setBusy(false);
    }
  };

  const handleReschedule = async (id: string, value: string) => {
    if (!value) return;
    setBusy(true);
    try {
      await rescheduleVisit(id, new Date(value).toISOString());
      toast.success("Visit rescheduled successfully", {
        position: "top-right",
        duration: 3000,
        style: {
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0",
          fontSize: "13px",
          fontWeight: 600,
        },
      });
      await loadVisits();
    } catch (rescheduleError) {
      const msg = rescheduleError instanceof Error ? rescheduleError.message : "Unable to reschedule visit";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <BookingHeader loading={loading} onRefresh={() => void loadVisits(true)} onNewVisit={() => setCreateOpen(true)} />
        {loading && <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">Loading live visit calendar...</div>}
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
        <BookingToolbar visits={visits} days={days} week={week} statusFilter={statusFilter} onStatusChange={setStatusFilter} onPreviousWeek={() => moveWeek(-1)} onNextWeek={() => moveWeek(1)} onToday={goToToday} />
        <BookingStats visits={visits} />

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
          <WeekCalendar days={days} statusFilter={statusFilter} selectedDate={selectedDate} onSelectDate={setSelectedDate} onSelectVisit={setSelectedVisit} />
          <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {selectedVisit ? (
              <VisitDetails
                visit={selectedVisit}
                busy={busy}
                onClose={() => setSelectedVisit(null)}
                onCancel={() => void handleCancel(selectedVisit.id)}
                onReschedule={(value) => void handleReschedule(selectedVisit.id, value)}
              />
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <CalendarDays size={30} className="text-blue-500" />
                <h2 className="mt-3 font-semibold">Select a visit</h2>
                <p className="mt-1 max-w-[220px] text-xs text-slate-500">
                  {filteredVisits.length} matching visit{filteredVisits.length === 1 ? "" : "s"}. Choose an event to inspect its details.
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <InsightCard title="Private Chauffeur Assigned" text="Dispatch status from the live visit workflow." />
          <InsightCard title="IoT Digital Pass Validated" text="Property access details remain backend controlled." />
          <InsightCard title="Automated Feedback Trigger" text="Follow-up actions can be attached to completed visits." />
        </section>
      </div>
      {createOpen && (
        <CreateVisitModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            void loadVisits();
            setCreateOpen(false);
          }}
        />
      )}
    </div>
  );
};
