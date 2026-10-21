import { useMemo, useState, useEffect, useRef } from "react";
import type { ReactNode, FormEvent, ChangeEvent } from "react";
import { Bell, Menu, Plus, Search, X, MapPin } from "lucide-react";
import "./styles.css";
import { useAuth } from "../../auth/AuthContext";
import { fetchLeads, createLead, updateLead } from "../../services/crmService";
import type { Lead, LeadStatus, PropertyMatch } from "../../services/crmService";

const statuses: Array<LeadStatus | "All"> = [
  "All",
  "New",
  "Contacted",
  "Interested",
  "Visit Scheduled",
  "Closed",
];

const leadStatuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Visit Scheduled",
  "Closed",
];

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function getInitials(name?: string) {
  if (!name) return "LD";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "LD";
}

function IconButton({
      label,
      children,
      onClick,
      className = "",
    }: {
      label?: string;
      children: ReactNode;
      onClick?: () => void;
      className?: string;
    }) {
      return (
        <button
          type="button"
          className={`icon-button ${className}`}
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </button>
      );
}

function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className="status-pill bg-slate-100 text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function LeadTable({
  leadsToShow,
  onSelect,
}: {
  leadsToShow: Lead[];
  onSelect: (lead: Lead) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
            <th className="px-6 py-3">Lead</th>
            <th className="px-3 py-3">Contact</th>
            <th className="px-3 py-3">City & Budget</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leadsToShow.map((lead) => (
            <tr
              key={lead.id}
              className="cursor-pointer transition hover:bg-slate-50/80"
              onClick={() => onSelect(lead)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="avatar bg-slate-100 text-slate-700">
                    {getInitials(lead.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{lead.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{lead.city || "No city"}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4">
                <p className="text-sm text-slate-600">{lead.email || "—"}</p>
                <p className="mt-1 text-xs text-slate-400">{lead.phone}</p>
              </td>
              <td className="px-3 py-4">
                <p className="text-sm font-semibold">{lead.city || "—"}</p>
                <p className="mt-1 text-sm font-bold text-blue-600">{lead.budget || "—"}</p>
              </td>
              <td className="px-3 py-4">
                <StatusPill status={lead.status} />
              </td>
              <td className="px-3 py-4">
                <p className="text-sm font-semibold">{lead.source || "Direct"}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(lead.created_at)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leadsToShow.length === 0 && (
        <p className="p-12 text-center text-sm text-slate-500">No leads found.</p>
      )}
    </div>
  );
}

function LeadDetails({
  lead,
  onClose,
  onUpdateStatus,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
}) {
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(lead.id, e.target.value as LeadStatus);
  };

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside className="drawer">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <div className="flex items-center gap-3">
              <StatusPill status={lead.status} />
              <select
                value={lead.status}
                onChange={handleStatusChange}
                className="select-button text-xs py-1 px-2"
              >
                {leadStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <h2 className="font-display mt-4 text-2xl font-bold">{lead.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{lead.email}</p>
          </div>
          <IconButton label="Close details" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div>
            <p className="section-label">Customer Requirements</p>
            <div className="mt-3 rounded-xl border border-slate-100 p-4 text-sm space-y-3">
              <div className="detail-row">
                <span>City</span>
                <strong>{lead.city || "Not specified"}</strong>
              </div>
              <div className="detail-row">
                <span>Budget</span>
                <strong className="text-blue-600">{lead.budget || "Not specified"}</strong>
              </div>
              <div className="detail-row">
                <span>Bedrooms</span>
                <strong>{lead.bedrooms || "Not specified"}</strong>
              </div>
              <div className="detail-row">
                <span>Phone</span>
                <strong>{lead.phone}</strong>
              </div>
            </div>
          </div>

          <div>
            <p className="section-label">AI Recommended Property Matches</p>
            <div className="mt-3 space-y-3">
              {lead.property_matches && lead.property_matches.length > 0 ? (
                lead.property_matches.map((match: PropertyMatch) => (
                  <div
                    key={match.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{match.title}</h4>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">
                        {match.matchScore} match
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> {match.location} · {match.price}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No property matches recommended yet by AI.
                </div>
              )}
            </div>
          </div>

          {lead.notes && (
            <div>
              <p className="section-label">Notes</p>
              <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {lead.notes}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function Crm() {
  const { accessToken, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  // New lead form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newBedrooms, setNewBedrooms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orgId = user?.organization_id || "";

  const showToast = (message: string) => {
    setNotice(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(""), 3000);
  };

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!accessToken || !orgId) {
      setIsLoading(false);
      setError("You are not logged in or no organization is linked to your account.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLeads(accessToken, orgId);
        if (!cancelled) setLeads(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load leads");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, orgId]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        (lead.name && lead.name.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.toLowerCase().includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.city && lead.city.toLowerCase().includes(query));
      const matchesFilter = filter === "All" || lead.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [leads, search, filter]);

  const resetForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewCity("");
    setNewBudget("");
    setNewBedrooms("");
  };

  const handleCreateLead = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !orgId) return;
    if (!newName.trim() || !newPhone.trim()) {
      showToast("Name and phone are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createLead(
        {
          name: newName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim(),
          city: newCity.trim(),
          budget: newBudget.trim(),
          bedrooms: newBedrooms ? Number(newBedrooms) : undefined,
          status: "New",
          source: "Manual Entry",
        },
        accessToken,
        orgId
      );
      setLeads((prev) => [created, ...prev]);
      setShowAdd(false);
      resetForm();
      showToast("Lead created successfully");
    } catch (err: any) {
      showToast(err.message || "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: LeadStatus) => {
    if (!accessToken || !orgId) return;
    try {
      const updated = await updateLead(id, { status: newStatus }, accessToken, orgId);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
      setSelectedLead((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
      showToast("Lead status updated");
    } catch (err: any) {
      showToast(err.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <IconButton label="Open menu" onClick={() => showToast("Menu coming soon")}>
            <Menu size={20} />
          </IconButton>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">
              Estate Flow CRM
            </p>
            <h1 className="font-display text-xl font-bold">
              Leads & Customers <span className="text-blue-600">.</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications" onClick={() => showToast("All caught up")}>
            <Bell size={18} />
          </IconButton>
          <button type="button" className="primary-button" onClick={() => setShowAdd(true)}>
            <Plus size={17} /> Add lead
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-7 p-5 md:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Single Source of Truth</p>
            <h2 className="font-display mt-1 text-3xl font-bold tracking-tight md:text-4xl">
              Client Pipeline.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Manage all leads captured via web chat, WhatsApp, and manual entry.
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error} (Make sure backend is running and you are logged in)
          </div>
        )}

        <section className="panel overflow-hidden p-0">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl font-bold">Leads</h3>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                    {filteredLeads.length} shown
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Search by name, phone number, email, or city.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
                  size={17}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="search-input pr-10"
                  placeholder="Search by name, phone, email or city..."
                />
                {search && (
                  <IconButton
                    label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1.5"
                  >
                    <X size={16} />
                  </IconButton>
                )}
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1">
                {statuses.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={`filter-pill ${filter === status ? "filter-active" : ""}`}
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading leads from server...
            </div>
          ) : (
            <LeadTable leadsToShow={filteredLeads} onSelect={setSelectedLead} />
          )}

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>
              Showing <strong className="text-slate-900">{filteredLeads.length}</strong> leads
            </span>
          </div>
        </section>
      </main>

      {selectedLead && (
        <LeadDetails
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">New contact</p>
                <h2 className="font-display mt-1 text-2xl font-bold">Add a lead</h2>
              </div>
              <IconButton label="Close add lead" onClick={() => setShowAdd(false)}>
                <X size={19} />
              </IconButton>
            </div>
            <form onSubmit={handleCreateLead} className="mt-6 space-y-4">
              <input
                className="form-input"
                placeholder="Full name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                className="form-input"
                placeholder="Phone number *"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />
              <input
                className="form-input"
                placeholder="Email address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="City (e.g. Marrakech)"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="Budget (e.g. €250,000)"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="Bedrooms (e.g. 2)"
                type="number"
                min={0}
                value={newBedrooms}
                onChange={(e) => setNewBedrooms(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="secondary-button flex-1 justify-center"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button flex-1 justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && (
        <div className="toast">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-blue-600">
            ✓
          </span>
          {notice}
        </div>
      )}
    </div>
  );
}

export default Crm;