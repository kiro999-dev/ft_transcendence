import { useState } from "react";
import type { ChangeEvent } from "react";
import { MapPin, X } from "lucide-react";
import { updateLead } from "../../../services/crmService";
import type { Lead, LeadStatus } from "../../../services/crmService";
import { Avatar } from "./Avatar";
import { StatusChip } from "./StatusChip";
import { STATUSES, formatBudget, formatDate } from "./leadUtils";

type LeadDetailsProps = {
  lead: Lead;
  token: string;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export function LeadDetails({ lead, token, onClose, onUpdated }: LeadDetailsProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const newStatus = event.target.value as LeadStatus;
    try {
      setSaving(true);
      setError("");
      const updated = await updateLead(lead.id, { status: newStatus }, token);
      onUpdated(updated);
    } catch {
      setError("Could not change the status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const matches = lead.property_matches ?? [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40">
      <button className="flex-1 cursor-default" onClick={onClose} aria-label="Close" />

      <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={lead.name} />
            <div>
              <p className="text-lg font-bold text-slate-900">{lead.name}</p>
              <p className="text-xs text-slate-500">Added {formatDate(lead.created_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Status</p>
            <StatusChip status={lead.status} />
          </div>
          <select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={saving}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-60"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {saving && <p className="mt-2 text-xs text-slate-500">Saving...</p>}
          {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Contact</p>
        <div className="mt-2 divide-y divide-slate-100">
          <InfoRow label="Phone" value={lead.phone || "—"} />
          <InfoRow label="Email" value={lead.email || "—"} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Looking for</p>
        <div className="mt-2 divide-y divide-slate-100">
          <InfoRow label="City" value={lead.city || "—"} />
          <InfoRow label="Budget" value={formatBudget(lead.budget)} />
          <InfoRow label="Bedrooms" value={lead.bedrooms ? String(lead.bedrooms) : "—"} />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">
          AI property matches
        </p>
        {matches.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            No matches suggested by the AI yet.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {matches.map((match) => (
              <div key={match.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{match.title}</p>
                  <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-bold text-primary">
                    {match.matchScore}% match
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} /> {match.location} · {formatBudget(match.price)}
                </p>
              </div>
            ))}
          </div>
        )}

        {lead.notes && (
          <>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Notes</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{lead.notes}</p>
          </>
        )}
      </aside>
    </div>
  );
}
