import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import "./styles.css";
import { StatCard } from "./components/StatCard";
import { PipelineChart } from "./components/PipelineChart";
import { LeadsTable } from "./components/LeadsTable";
import { LeadDetails } from "./components/LeadDetails";
import { AddLeadModal } from "./components/AddLeadModal";
import { useAuth } from "../../auth/AuthContext";
import { fetchLeads } from "../../services/crmService";
import type { Lead } from "../../services/crmService";

export function Crm() {
  const { accessToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // 1. Load the leads when the page opens
  useEffect(() => {
    async function loadLeads(token: string) {
      try {
        const data = await fetchLeads(token);
        setLeads(data);
      } catch {
        setError("Could not load your leads. Is the backend running?");
      }
    }

    if (accessToken) {
      loadLeads(accessToken);
    }
  }, [accessToken]);

  // 2. When a lead is changed in the side panel, replace it in the list
  function handleUpdated(updated: Lead) {
    setLeads(leads.map((lead) => (lead.id === updated.id ? updated : lead)));
    setSelectedLead(updated);
  }

  // 3. Numbers for the cards and the pipeline
  function countStatus(status: string) {
    return leads.filter((lead) => lead.status === status).length;
  }

  const total = leads.length;
  const closedCount = countStatus("Closed");
  const inProgress = countStatus("Contacted") + countStatus("Interested") + countStatus("Visit Scheduled");
  const conversion = total === 0 ? 0 : Math.round((closedCount / total) * 100);

  const stages = [
    { label: "New", count: countStatus("New"), color: "bg-blue-300" },
    { label: "Contacted", count: countStatus("Contacted"), color: "bg-blue-400" },
    { label: "Interested", count: countStatus("Interested"), color: "bg-blue-500" },
    { label: "Visit Scheduled", count: countStatus("Visit Scheduled"), color: "bg-primary" },
    { label: "Closed", count: closedCount, color: "bg-primary-dark" },
    { label: "Lost", count: countStatus("Lost"), color: "bg-slate-400" },
  ];

  // 4. The page
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads & Customers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your clients from first contact to closed deal.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Leads" value={total} note="All your clients" />
        <StatCard title="In Progress" value={inProgress} note="Contacted, interested or visiting" />
        <StatCard title="Closed Deals" value={closedCount} note="Clients who signed" />
        <StatCard title="Conversion" value={`${conversion}%`} note="Of all leads are closed" />
      </section>

      <section className="mt-6">
        <PipelineChart stages={stages} />
      </section>

      <section className="mt-6">
        <LeadsTable leads={leads} onSelect={setSelectedLead} />
      </section>

      {showAdd && accessToken && (
        <AddLeadModal
          token={accessToken}
          onClose={() => setShowAdd(false)}
          onCreated={(lead) => setLeads([lead, ...leads])}
        />
      )}

      {selectedLead && accessToken && (
        <LeadDetails
          lead={selectedLead}
          token={accessToken}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
