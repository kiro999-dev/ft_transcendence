import { useEffect, useState } from "react";
import { X, CalendarPlus, Loader2, Clock, MapPin, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { createVisit, fetchAvailability, fetchLeads, fetchProperties } from "./bookingApi";
import type { AvailabilitySlot, Lead, Property } from "./bookingApi";
import { dateKey, formatTime } from "./bookingHelpers";
import { CustomSelect } from "./CustomSelect";
import { CustomDatePicker } from "./CustomDatePicker";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
];

type CreateVisitModalProps = {
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateVisitModal({ onClose, onCreated }: CreateVisitModalProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [visitDate, setVisitDate] = useState(dateKey(new Date()));
  const [duration, setDuration] = useState(30);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedProperties, loadedLeads] = await Promise.all([
          fetchProperties(),
          fetchLeads(),
        ]);
        setProperties(loadedProperties);
        setLeads(loadedLeads);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load form data");
      } finally {
        setLoading(false);
      }
    };

    void loadFormData();
  }, []);

  useEffect(() => {
    if (!propertyId) {
      setSlots([]);
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot("");
      setError(null);
      try {
        setSlots(await fetchAvailability(propertyId, visitDate, duration));
      } catch (slotError) {
        setError(slotError instanceof Error ? slotError.message : "Unable to load available slots");
      } finally {
        setLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [propertyId, visitDate, duration]);

  const handleCreate = async () => {
    if (!propertyId || !leadId || !selectedSlot) return;
    const slot = slots.find((s) => s.starts_at === selectedSlot);
    if (!slot) return;

    setCreating(true);
    setError(null);

    try {
      await createVisit(
        {
          property_id: propertyId,
          lead_id: leadId,
          contact_id: leadId,
          agent_id: slot.agent_id,
          starts_at: selectedSlot,
          duration_minutes: duration,
          customer_notes: notes.trim() || undefined,
        },
        user?.organization_id,
      );

      toast.success("Visit scheduled successfully!", {
        position: "top-right",
        duration: 3500,
        style: {
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0",
          fontSize: "13px",
          fontWeight: 600,
        },
      });

      if (onCreated) {
        onCreated();
      } else {
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to schedule visit";
      setError(msg);
      toast.error(msg, { position: "top-right" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600">
              <CalendarPlus size={14} />
              <span>Scheduling &amp; Agent Dispatch</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Schedule New Visit</h2>
            <p className="mt-0.5 text-xs text-slate-500">Choose a real time slot from the live availability engine.</p>
          </div>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={17} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
            Loading properties and clients...
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <MapPin size={13} className="text-slate-400" />
                  Property
                </span>
                <CustomSelect
                  fullWidth
                  value={propertyId}
                  onChange={setPropertyId}
                  placeholder="Select property"
                  options={properties.map((p) => ({ value: p.id, label: p.title }))}
                />
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <User size={13} className="text-slate-400" />
                  Client
                </span>
                <CustomSelect
                  fullWidth
                  value={leadId}
                  onChange={setLeadId}
                  placeholder="Select client"
                  options={leads.map((l) => ({
                    value: l.id,
                    label: l.name || l.phone,
                    sublabel: l.name && l.phone ? l.phone : undefined,
                  }))}
                />
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <Clock size={13} className="text-slate-400" />
                  Date
                </span>
                <CustomDatePicker
                  value={visitDate}
                  minDate={dateKey(new Date())}
                  onChange={setVisitDate}
                />
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                  <Clock size={13} className="text-slate-400" />
                  Duration
                </span>
                <CustomSelect<number>
                  fullWidth
                  value={duration}
                  onChange={setDuration}
                  options={DURATION_OPTIONS}
                />
              </div>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-700">
              Customer Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 shadow-2xs transition hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Optional customer notes or instructions"
              />
            </label>

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-700">Available Slots</p>
              {loadingSlots ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                  Checking availability...
                </div>
              ) : slots.length === 0 ? (
                <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center text-xs text-slate-500">
                  {propertyId ? "No slots available for this date/property." : "Select a property to view real available slots."}
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isSelected = selectedSlot === slot.starts_at;
                    return (
                      <button
                        type="button"
                        key={slot.starts_at}
                        onClick={() => setSelectedSlot(slot.starts_at)}
                        className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/90 text-blue-700 shadow-2xs ring-2 ring-blue-500/20"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50 shadow-2xs"
                        }`}
                      >
                        <b className="block font-semibold">{formatTime(slot.starts_at)}</b>
                        <span className="block truncate text-[11px] text-slate-500">{slot.agent_name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!propertyId || !leadId || !selectedSlot || creating}
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarPlus size={14} />
                    Schedule Visit
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
