import { useEffect, useState } from "react";
import { Check, Clock3, Plus, Save, Trash2, X, RotateCcw, Loader2, CalendarOff, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { createException, deleteException, fetchExceptions, fetchWeeklyAvailability, saveWeeklyAvailability } from "./availabilityApi";
import type { AvailabilityRule, CalendarException } from "./availabilityApi";
import { CustomSelect } from "../booking/CustomSelect";
import { CustomDatePicker } from "../booking/CustomDatePicker";
import { CustomTimePicker } from "../booking/CustomTimePicker";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
  { value: 90, label: "90 minutes" },
  { value: 120, label: "120 minutes" },
];

const WEEK_DAYS = [
  { name: "Monday", dayOfWeek: 1 },
  { name: "Tuesday", dayOfWeek: 2 },
  { name: "Wednesday", dayOfWeek: 3 },
  { name: "Thursday", dayOfWeek: 4 },
  { name: "Friday", dayOfWeek: 5 },
  { name: "Saturday", dayOfWeek: 6 },
  { name: "Sunday", dayOfWeek: 0 },
];

const newRule = (dayOfWeek: number): AvailabilityRule => ({ dayOfWeek, startTime: "09:00", endTime: "18:00" });

export const Availability = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [savedRules, setSavedRules] = useState<AvailabilityRule[]>([]);
  const [duration, setDuration] = useState(30);
  const [exceptions, setExceptions] = useState<CalendarException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [weekly, loadedExceptions] = await Promise.all([fetchWeeklyAvailability(user.id), fetchExceptions(user.id)]);
      setRules(weekly.rules);
      setSavedRules(weekly.rules);
      setDuration(weekly.slotDuration);
      setExceptions(loadedExceptions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [user?.id]);

  const toggle = (dayOfWeek: number) =>
    setRules((current) =>
      current.some((rule) => rule.dayOfWeek === dayOfWeek)
        ? current.filter((rule) => rule.dayOfWeek !== dayOfWeek)
        : [...current, newRule(dayOfWeek)].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    );

  const changeRule = (dayOfWeek: number, field: "startTime" | "endTime", value: string) =>
    setRules((current) =>
      current.map((rule) => (rule.dayOfWeek === dayOfWeek ? { ...rule, [field]: value } : rule)),
    );

  const save = async () => {
    if (!user?.id) return;

    const invalidRule = rules.find((rule) => rule.startTime >= rule.endTime);
    if (invalidRule) {
      const errorMessage = "Start time must be before end time";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await saveWeeklyAvailability({ userId: user.id, slotDuration: duration, rules });
      setSavedRules(rules);
      setMessage("Availability schedule saved.");
      toast.success("Availability schedule saved successfully", {
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
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : "Unable to save availability";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setSaving(false);
    }
  };

  const addException = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || !date) return;
    setAdding(true);
    setError(null);
    setMessage(null);
    try {
      const created = await createException({
        userId: user.id,
        date,
        isUnavailable: true,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        reason: reason || undefined,
      });
      setExceptions((current) => [...current, created]);
      setDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
      setMessage("Unavailable time added.");
      toast.success("Unavailable time added successfully", {
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
    } catch (addError) {
      const msg = addError instanceof Error ? addError.message : "Unable to add unavailable time";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setAdding(false);
    }
  };

  const removeException = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteException(id);
      setExceptions((current) => current.filter((item) => item.id !== id));
      setMessage("Unavailable time removed.");
      toast.success("Unavailable time removed", {
        position: "top-right",
        duration: 2500,
      });
    } catch (removeError) {
      const msg = removeError instanceof Error ? removeError.message : "Unable to remove unavailable time";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setDeletingId(null);
    }
  };

  if (!user?.id) {
    return <div className="min-h-screen bg-[#f8fafc] p-8 text-sm text-slate-600">Your user profile is not available yet.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 text-[#0f172a] sm:p-8">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span>Scheduling &amp; Agent Dispatch</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600">Availability Control</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Working Hours &amp; Availability</h1>
          <p className="mt-1 text-xs text-slate-500">Configure the schedule used by the real-time booking engine.</p>
        </header>

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-2xs">
            <Loader2 size={14} className="animate-spin text-blue-600" />
            Loading saved availability...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Weekly Schedule</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">Only enabled days are returned as available booking slots.</p>
            </div>

            <CustomSelect<number>
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
              prefix="SLOT DURATION:"
              align="right"
              buttonClassName="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99]"
            />
          </div>

          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200/80 overflow-hidden">
            {WEEK_DAYS.map(({ name, dayOfWeek }) => {
              const rule = rules.find((item) => item.dayOfWeek === dayOfWeek);
              return (
                <div
                  key={dayOfWeek}
                  className={`grid gap-3 px-4 py-3 sm:grid-cols-[1.2fr_1fr_1fr_110px] sm:items-center transition-colors ${
                    rule ? "bg-white" : "bg-slate-50/50 opacity-75"
                  }`}
                >
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(rule)}
                      onChange={() => toggle(dayOfWeek)}
                      className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                    />
                    <span className={rule ? "text-slate-900 font-bold" : "text-slate-500"}>{name}</span>
                  </label>

                  {/* Start Time Input */}
                  <div className="flex flex-col">
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Start
                    </span>
                    <div
                      className={`group relative flex items-center rounded-xl border transition-all ${
                        rule
                          ? "border-slate-200 bg-white hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 shadow-2xs"
                          : "border-slate-200/60 bg-slate-100/70 text-slate-400"
                      }`}
                    >
                      <div className="pointer-events-none pl-2.5 text-slate-400 group-focus-within:text-blue-600">
                        <Clock3 size={13} />
                      </div>
                      <input
                        type="time"
                        disabled={!rule}
                        value={rule?.startTime ?? ""}
                        onChange={(event) => changeRule(dayOfWeek, "startTime", event.target.value)}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs font-semibold tracking-tight text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                      />
                    </div>
                  </div>

                  {/* End Time Input */}
                  <div className="flex flex-col">
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      End
                    </span>
                    <div
                      className={`group relative flex items-center rounded-xl border transition-all ${
                        rule
                          ? "border-slate-200 bg-white hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100 shadow-2xs"
                          : "border-slate-200/60 bg-slate-100/70 text-slate-400"
                      }`}
                    >
                      <div className="pointer-events-none pl-2.5 text-slate-400 group-focus-within:text-blue-600">
                        <Clock3 size={13} />
                      </div>
                      <input
                        type="time"
                        disabled={!rule}
                        value={rule?.endTime ?? ""}
                        onChange={(event) => changeRule(dayOfWeek, "endTime", event.target.value)}
                        className="w-full bg-transparent px-2.5 py-1.5 text-xs font-semibold tracking-tight text-slate-800 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-400 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                      />
                    </div>
                  </div>

                  <span className="text-xs font-medium">
                    {rule ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                setRules(savedRules);
                setMessage(null);
                setError(null);
                toast("Changes reset", { icon: "↩️", position: "top-right" });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 active:scale-95"
            >
              <RotateCcw size={13} />
              Reset Changes
            </button>

            <button
              type="button"
              disabled={saving || loading}
              onClick={() => void save()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving Schedule...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={(event) => void addException(event)}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CalendarOff size={18} className="text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Block Time</h2>
                <p className="text-[11px] text-slate-500">Add a full-day or time-range calendar exception.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex flex-col">
                <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </span>
                <CustomDatePicker
                  required
                  value={date}
                  onChange={setDate}
                  placeholder="Select exception date..."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Start (Optional)
                  </span>
                  <CustomTimePicker
                    value={startTime}
                    onChange={setStartTime}
                    placeholder="Start time"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    End (Optional)
                  </span>
                  <CustomTimePicker
                    value={endTime}
                    onChange={setEndTime}
                    placeholder="End time"
                  />
                </div>
              </div>

              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Reason
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. Holiday, personal time or maintenance"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-700 shadow-2xs transition hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={adding || !date}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Adding Exception...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Add Unavailable Time
                </>
              )}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Unavailable Dates</h2>
                <p className="mt-0.5 text-xs text-slate-500">Exceptions currently applied by the booking engine.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                {exceptions.length}
              </span>
            </div>

            {exceptions.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                No unavailable dates configured. All active weekly rules are open for booking.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200/80 max-h-80 overflow-y-auto">
                {exceptions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {new Date(item.startTime).toLocaleDateString([], { dateStyle: "medium" })}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {new Date(item.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {item.reason ? ` · ${item.reason}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      title="Remove exception"
                      disabled={deletingId === item.id}
                      onClick={() => void removeException(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-400 active:scale-95 disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={15} className="animate-spin text-red-500" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
