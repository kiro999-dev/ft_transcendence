import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { createLead } from "../../../services/crmService";
import type { Lead } from "../../../services/crmService";

type AddLeadModalProps = {
  token: string;
  onClose: () => void;
  onCreated: (lead: Lead) => void;
};

const inputStyle =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AddLeadModal({ token, onClose, onCreated }: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const lead = await createLead({ name, phone, email, city, budget }, token);
      onCreated(lead);
      onClose();
    } catch {
      setError("Could not save the lead. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">Add a lead</p>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            className={inputStyle}
            placeholder="Full name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={inputStyle}
            placeholder="Phone *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className={inputStyle}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputStyle}
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              className={inputStyle}
              placeholder="Budget"
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
