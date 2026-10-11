// React hooks keep the CRM search, filters, drawer, modal, and toast state.
import { useMemo, useState } from "react";

// Icons are the only visual dependency used by this page.
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileUp,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";

// These are the only states a lead can have in the CRM.
type Status = "New" | "Contacted" | "Interested" | "Visit Scheduled" | "Closed";

// One lead object contains everything shown in the table and details drawer.
type Lead = {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  property: string;
  budget: string;
  status: Status;
  activity: string;
  source: string;
  profile: string;
  score: string;
  created: string;
};

// Temporary local data used to show the CRM until the API is connected.
const leads: Lead[] = [
  {
    id: 1,
    name: "Mohamed Amrani",
    initials: "MA",
    email: "mohamed@gmail.com",
    phone: "+212 612 345 678",
    property: "Apartment in Marrakech",
    budget: "€240,000",
    status: "Interested",
    activity: "2 hours ago",
    source: "WhatsApp inquiry",
    profile: "Pre-approved Mortgage",
    score: "94%",
    created: "Sep 26, 2026",
  },
  {
    id: 2,
    name: "Sara Bennani",
    initials: "SB",
    email: "sara.bennani@outlook.com",
    phone: "+212 661 889 123",
    property: "Palm Grove Villa",
    budget: "€750,000",
    status: "Visit Scheduled",
    activity: "42 min ago",
    source: "Note added",
    profile: "Cash Buyer",
    score: "AI Hot",
    created: "Sep 25, 2026",
  },
  {
    id: 3,
    name: "Ahmed Tazi",
    initials: "AT",
    email: "ahmed.tazi@company.ma",
    phone: "+212 655 210 994",
    property: "Gueliz Luxury Penthouse",
    budget: "€420,000",
    status: "Contacted",
    activity: "3 hours ago",
    source: "Email opened (2x)",
    profile: "Investor Profile",
    score: "88%",
    created: "Sep 24, 2026",
  },
  {
    id: 4,
    name: "Fatima Zahra",
    initials: "FZ",
    email: "fatima.z@gmail.com",
    phone: "+212 670 114 552",
    property: "Oceanfront Studio",
    budget: "€180,000",
    status: "New",
    activity: "15 min ago",
    source: "Website inquiry form",
    profile: "First-time Buyer",
    score: "91%",
    created: "Sep 27, 2026",
  },
  {
    id: 5,
    name: "Youssef El Alami",
    initials: "YA",
    email: "youssef.alami@fin.ma",
    phone: "+212 663 902 441",
    property: "Hivernage Residence",
    budget: "€510,000",
    status: "Closed",
    activity: "Yesterday",
    source: "Contract signed",
    profile: "Repeat Client",
    score: "100% Won",
    created: "Sep 20, 2026",
  },
  {
    id: 6,
    name: "Karim Mansouri",
    initials: "KM",
    email: "karim.m@gmail.com",
    phone: "+212 614 773 201",
    property: "Atlas View Villa",
    budget: "€920,000",
    status: "Interested",
    activity: "1 day ago",
    source: "Virtual tour finished",
    profile: "High Net Worth",
    score: "96%",
    created: "Sep 22, 2026",
  },
];

// Buttons used to filter the leads table.
const statuses: Array<Status | "All"> = [
  "All",
  "New",
  "Contacted",
  "Interested",
  "Visit Scheduled",
  "Closed",
];

// Numbers shown in the four summary cards at the top.
const metrics = [
  ["Total leads", "248", "+12.4%", Users],
  ["New this month", "42", "+8.2%", Zap],
  ["Active pipeline", "76", "31% of total", Target],
  ["Closed revenue", "€4.2M", "+18.6%", CircleDollarSign],
] as const;

// Numbers shown in the pipeline progress cards.
const stages = [
  ["New", 42, "100%"],
  ["Contacted", 76, "78%"],
  ["Interested", 58, "62%"],
  ["Visits", 40, "44%"],
  ["Closed", 32, "35%"],
] as const;

// Reusable icon-only button. The label keeps it accessible for screen readers.
function IconButton({
  label,
  children,
  onClick,
}: {
  label?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className="icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

// Small neutral badge used wherever we display a lead status.
function StatusPill({ status }: { status: Status }) {
  return (
    <span className="status-pill bg-slate-100 text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// One summary card with a label, value, change, and progress bar.
function MetricCard({
  label,
  value,
  detail,
  Icon,
}: {
  label: string;
  value: string;
  detail: string;
  Icon: typeof Users;
}) {
  return (
    <article className="stat-card">
      <div className="flex items-center justify-between">
        <span className="section-label">{label}</span>
        <span className="stat-icon">
          <Icon size={17} />
        </span>
      </div>
      <div className="mt-5 flex items-baseline gap-3">
        <strong className="font-display text-3xl font-bold tracking-tight">{value}</strong>
        <span className={`text-xs font-bold ${detail.startsWith("+") ? "text-blue-600" : "text-slate-400"}`}>
          {detail}
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-3/4 rounded-full bg-blue-600" />
      </div>
    </article>
  );
}

// The main table. Clicking a row opens that lead's details drawer.
function LeadTable({
  leadsToShow,
  onSelect,
  onNotice,
}: {
  leadsToShow: Lead[];
  onSelect: (lead: Lead) => void;
  onNotice: (message: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      {/* Keep the table wide enough to stay readable on small screens. */}
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
            <th className="px-6 py-3">Lead</th>
            <th className="px-3 py-3">Contact</th>
            <th className="px-3 py-3">Property & budget</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Last activity</th>
            <th className="px-6 py-3 text-right">Actions</th>
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
                  <div className="avatar bg-slate-100 text-slate-700">{lead.initials}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{lead.name}</p>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {lead.score}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{lead.profile}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4">
                <p className="text-sm text-slate-600">{lead.email}</p>
                <p className="mt-1 text-xs text-slate-400">{lead.phone}</p>
              </td>
              <td className="px-3 py-4">
                <p className="text-sm font-semibold">{lead.property}</p>
                <p className="mt-1 text-sm font-bold text-blue-600">{lead.budget}</p>
              </td>
              <td className="px-3 py-4"><StatusPill status={lead.status} /></td>
              <td className="px-3 py-4">
                <p className="text-sm font-semibold">{lead.activity}</p>
                <p className="mt-1 text-xs text-slate-400">{lead.source}</p>
              </td>
              <td className="px-6 py-4 text-right">
                <IconButton label={`Email ${lead.name}`} onClick={() => onNotice(`Email ready for ${lead.name}`)}>
                  <Mail size={16} />
                </IconButton>
                <IconButton label={`Call ${lead.name}`} onClick={() => onNotice(`Calling ${lead.name}`)}>
                  <Phone size={16} />
                </IconButton>
                <IconButton label={`More actions for ${lead.name}`}><MoreHorizontal size={16} /></IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leadsToShow.length === 0 && <p className="p-12 text-center text-sm text-slate-500">No leads match your search.</p>}
    </div>
  );
}

// Side drawer with the selected lead's contact information and actions.
function LeadDetails({
  lead,
  onClose,
  onNotice,
}: {
  lead: Lead;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-40">
      {/* Clicking the dark overlay closes the drawer. */}
      <button className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" aria-label="Close details" onClick={onClose} />
      <aside className="drawer">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <StatusPill status={lead.status} />
            <h2 className="font-display mt-4 text-2xl font-bold">{lead.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{lead.property}</p>
          </div>
          <IconButton label="Close details" onClick={onClose}><X size={19} /></IconButton>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* This is a simple placeholder for a future AI recommendation. */}
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Sparkles size={15} /> AI broker insight
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">High-intent qualified buyer. Follow up today to keep momentum.</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button className="drawer-action" onClick={() => onNotice("Calling lead")}><Phone size={16} /> Call</button>
            <button className="drawer-action" onClick={() => onNotice("Email ready")}><Mail size={16} /> Email</button>
            <button className="drawer-action" onClick={() => onNotice("WhatsApp opened")}><MessageCircle size={16} /> Chat</button>
          </div>

          <div>
            <p className="section-label">Contact overview</p>
            <div className="mt-3 rounded-xl border border-slate-100 p-4 text-sm">
              <div className="detail-row"><span>Email</span><strong>{lead.email}</strong></div>
              <div className="detail-row"><span>Phone</span><strong>{lead.phone}</strong></div>
              <div className="detail-row"><span>Budget</span><strong className="text-blue-600">{lead.budget}</strong></div>
            </div>
          </div>

          <div>
            <p className="section-label">Timeline</p>
            <div className="mt-4 space-y-5 border-l-2 border-slate-100 pl-5">
              <div className="relative">
                <span className="timeline-dot bg-blue-600" />
                <p className="text-sm font-bold">Inbound inquiry received</p>
                <p className="mt-1 text-xs text-slate-400">{lead.source} · {lead.activity}</p>
              </div>
              <div className="relative">
                <span className="timeline-dot bg-slate-300" />
                <p className="text-sm font-bold">Lead profile created</p>
                <p className="mt-1 text-xs text-slate-400">{lead.created}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-6">
          <button className="primary-button w-full justify-center" onClick={() => onNotice("Note added to lead")}>
            <Plus size={16} /> Add quick note
          </button>
        </div>
      </aside>
    </div>
  );
}

export function Crm() {
  // Page state: table query, active filter, selected lead, add modal, and toast.
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState("");

  // Search and status filtering stay together so the table is easy to follow.
  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch = `${lead.name} ${lead.email} ${lead.property}`
        .toLowerCase()
        .includes(query);
      const matchesFilter = filter === "All" || lead.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [filter, search]);

  // Buttons use this small message instead of adding another notification library.
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar with the menu, notifications, and add-lead action. */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <IconButton label="Open menu"><Menu size={20} /></IconButton>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">Monday, September 27, 2026</p>
            <h1 className="font-display text-xl font-bold">Good morning, Omar <span className="text-blue-600">.</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Notifications" onClick={() => showNotice("Notifications are all caught up")}><Bell size={18} /></IconButton>
          <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add lead</button>
        </div>
      </header>

      {/* All CRM content lives inside this centered page container. */}
      <main className="mx-auto max-w-[1440px] space-y-7 p-5 md:p-8">
        {/* Page title and report export button. */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Pipeline overview</p>
            <h2 className="font-display mt-1 text-3xl font-bold tracking-tight md:text-4xl">Your business at a glance.</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Stay on top of active conversations and move the right buyers forward.</p>
          </div>
          <button className="secondary-button" onClick={() => showNotice("Report exported successfully")}><Download size={16} /> Export report</button>
        </section>

        {/* Quick business numbers. */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, detail, Icon]) => <MetricCard key={label} label={label} value={value} detail={detail} Icon={Icon} />)}
        </section>

        {/* Pipeline progress on the left and recent activity on the right. */}
        <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <div className="panel">
            <div className="flex items-center justify-between">
              <div><p className="section-label">Conversion health</p><h3 className="font-display mt-1 text-lg font-bold">Pipeline stage flow</h3></div>
              <button className="select-button">This month <ChevronDown size={14} /></button>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {stages.map(([name, count, percent]) => (
                <div className="stage" key={name}>
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{name}</span><span className="h-2 w-2 rounded-full bg-blue-600" /></div>
                  <strong className="font-display mt-5 block text-2xl">{count}</strong>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600" style={{ width: percent }} /></div>
                  <span className="mt-2 block text-[11px] text-slate-400">{percent} conversion</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm"><Sparkles size={17} /></div>
              <p className="text-sm leading-relaxed text-slate-600"><strong className="text-slate-900">Smart recommendation:</strong> 14 interested leads have no viewing scheduled in 48h.</p>
              <button className="ml-auto whitespace-nowrap text-xs font-bold text-blue-600 hover:underline" onClick={() => showNotice("Outreach automation started")}>Automate outreach</button>
            </div>
          </div>

          <div className="panel">
            <div className="flex items-center justify-between"><div><p className="section-label">Live updates</p><h3 className="font-display mt-1 text-lg font-bold">Recent activity</h3></div><button className="text-xs font-bold text-blue-600 hover:underline">View all</button></div>
            <div className="mt-5 space-y-5">
              {["Mohamed Amrani", "Sara Bennani", "Ahmed Tazi", "Youssef El Alami"].map((name, index) => (
                <div className="flex gap-3" key={name}>
                  <div className="avatar bg-slate-100 text-slate-700">{name.split(" ").map((part) => part[0]).join("")}</div>
                  <div><p className="text-sm font-bold">{name}</p><p className="mt-1 text-xs text-slate-500">Recent lead activity</p><p className="mt-1 text-xs text-slate-400">{index + 1} hour ago</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Searchable and filterable leads table. */}
        <section className="panel overflow-hidden p-0">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div><div className="flex items-center gap-3"><h3 className="font-display text-xl font-bold">Leads</h3><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{filteredLeads.length} shown</span></div><p className="mt-1 text-sm text-slate-400">Manage conversations and keep your pipeline moving.</p></div>
              <div className="flex flex-wrap gap-2"><button className="secondary-button"><FileUp size={15} /> Import</button><select className="select-button" aria-label="Filter by property"><option>All properties</option><option>Villas</option><option>Apartments</option></select></div>
            </div>
            {/* Search input and status filter buttons. */}
            <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="search-input" placeholder="Search by name, email or property..." />{search && <IconButton label="Clear search" onClick={() => setSearch("")}><X size={16} /></IconButton>}</div>
              <div className="flex gap-1 overflow-x-auto pb-1">{statuses.map((status) => <button key={status} className={`filter-pill ${filter === status ? "filter-active" : ""}`} onClick={() => setFilter(status)}>{status}{status === "All" ? " (248)" : ""}</button>)}</div>
            </div>
          </div>

          {/* The table receives only the leads that match the current search/filter. */}
          <LeadTable leadsToShow={filteredLeads} onSelect={setSelectedLead} onNotice={showNotice} />

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>Showing <strong className="text-slate-900">{filteredLeads.length}</strong> of 248 leads</span>
            <div className="flex items-center gap-1"><button className="page-button" aria-label="Previous page"><ChevronLeft size={15} /></button><button className="page-button page-current">1</button><button className="page-button">2</button><button className="page-button">3</button><span className="px-2">...</span><button className="page-button" aria-label="Next page"><ChevronRight size={15} /></button></div>
          </div>
        </section>
      </main>

      {/* Render the drawer only after the user selects a lead. */}
      {selectedLead && <LeadDetails lead={selectedLead} onClose={() => setSelectedLead(null)} onNotice={showNotice} />}

      {/* Simple add-lead form. It currently shows feedback; API saving can be added later. */}
      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><p className="eyebrow">New contact</p><h2 className="font-display mt-1 text-2xl font-bold">Add a lead</h2></div><IconButton label="Close add lead" onClick={() => setShowAdd(false)}><X size={19} /></IconButton></div>
            <div className="mt-6 space-y-4"><input className="form-input" placeholder="Full name" /><input className="form-input" placeholder="Email address" type="email" /><input className="form-input" placeholder="Property of interest" /><div className="flex gap-3"><button className="secondary-button flex-1 justify-center" onClick={() => setShowAdd(false)}>Cancel</button><button className="primary-button flex-1 justify-center" onClick={() => { setShowAdd(false); showNotice("Lead added successfully"); }}>Save lead</button></div></div>
          </div>
        </div>
      )}

      {/* Temporary feedback shown after button actions. */}
      {notice && <div className="toast"><span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-blue-600">✓</span>{notice}</div>}
    </div>
  );
}

export default Crm;
