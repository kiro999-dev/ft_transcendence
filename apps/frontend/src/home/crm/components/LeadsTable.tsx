import { useState } from "react";
import { Search } from "lucide-react";
import type { Lead } from "../../../services/crmService";
import { Avatar } from "./Avatar";
import { StatusChip } from "./StatusChip";
import { STATUSES, formatBudget, formatDate } from "./leadUtils";

type LeadsTableProps = {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
};

export function LeadsTable({ leads, onSelect }: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const text = search.trim().toLowerCase();

  const shown = leads.filter((lead) => {
    const matchesFilter = filter === "All" || lead.status === filter;
    const matchesSearch =
      text === "" ||
      lead.name.toLowerCase().includes(text) ||
      lead.phone.toLowerCase().includes(text) ||
      lead.email.toLowerCase().includes(text) ||
      lead.city.toLowerCase().includes(text);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="rounded-3xl bg-white p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-slate-900">All Leads</p>
          <p className="mt-1 text-xs text-slate-500">{shown.length} shown</p>
        </div>

        <div className="relative lg:w-80">
          <Search size={16} className="pointer-events-none absolute left-4 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, city..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["All", ...STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              filter === status
                ? "bg-primary text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium">City</th>
              <th className="pb-3 font-medium">Budget</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelect(lead)}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.name} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.email || "No email"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-sm text-slate-600">{lead.phone}</td>
                <td className="py-3 text-sm text-slate-600">{lead.city || "—"}</td>
                <td className="py-3 text-sm font-semibold text-slate-900">{formatBudget(lead.budget)}</td>
                <td className="py-3"><StatusChip status={lead.status} /></td>
                <td className="py-3 text-sm text-slate-500">{formatDate(lead.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {shown.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No leads found.</p>
        )}
      </div>
    </div>
  );
}
