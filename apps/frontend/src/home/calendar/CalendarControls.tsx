import { useEffect, useState } from "react"


interface CalendarControlsProps {
  view: string
  setView: (view: string) => void
}

function CalendarControls({ view, setView }: CalendarControlsProps) {
  const views = ["Day", "Week", "Month", "Agenda"]
  //hadi mo2aqatan hta nbghi ndir l bakend
//   const [agents, setAgents] = useState<string[]>([])
    // useEffect(() => {
    // fetch("/api/agents")
    //     .then((res) => res.json())
    //     .then(setAgents)
    //     .catch(() => setAgents([]))
    // }, [])
    const [Sync_Calendar, setSync_Calendar] = useState(null);
    const agents = ["Sara Chen", "Karim El Amrani", "Youssef Bennis", "Leila Mansour"]
    const portfolios = ["Palmeraie Collection", "Guéliz Portfolio", "Atlas Views"]
  const statuses = ["Confirmed", "Pending", "Cancelled"]
    const [openFilter, setOpenFilter] = useState<string | null>(null)
    const index = agents.length;
    const index_portfolios = portfolios.length;
  return (
    <div className="mt-6">

      {/* VIEW CONTROLS */}
      <div className="flex items-center justify-between">

        <div className="flex items-center bg-white border border-slate-200 rounded-md p-1">

          {views.map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`px-4 py-2 text-sm font-medium rounded
                ${
                  view === item
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {item}
            </button>
          ))}

        </div>

        <button
          className="px-4 py-2 bg-white border border-slate-200
          rounded-md text-sm font-medium text-slate-700
          hover:bg-slate-50"
          onClick={() => setSync_Calendar(true)}
        >
          ↻ Sync Calendar
        </button>

      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-3 gap-4 mt-4">

        <div className="relative">
  <button
    onClick={() => setOpenFilter(openFilter === "agents" ? null : "agents")}
    className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-700"
  >
    <span>All Agents ({index})</span>
    <span className="text-slate-400">{openFilter === "agents" ? "⌃" : "⌄"}</span>
  </button>

  {openFilter === "agents" && (
  <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-md shadow-md z-10">
    {agents.map((agent) => (
      <div
        key={agent}
        className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
      >
        {agent}
      </div>
    ))}
  </div>
)}
</div>

        <div className="relative">
        <button
            onClick={() => setOpenFilter(openFilter === "portfolios" ? null : "portfolios")}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-700"
        >
            <span>All Portfolios ({index_portfolios})</span>
            <span className="text-slate-400">{openFilter === "portfolios" ? "⌃" : "⌄"}</span>
        </button>

        {openFilter === "portfolios" && (
            <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-md shadow-md z-10">
            {portfolios.map((p) => (
                <div key={p} className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                {p}
                </div>
            ))}
            </div>
        )}
        </div>

        <div className="relative">
        <button
            onClick={() => setOpenFilter(openFilter === "status" ? null : "status")}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-md px-4 py-3 text-sm text-slate-700"
        >
            <span>Status: Confirmed, Pending</span>
            <span className="text-slate-400">{openFilter === "status" ? "⌃" : "⌄"}</span>
        </button>

        {openFilter === "status" && (
            <div className="absolute mt-1 w-full bg-white border border-slate-200 rounded-md shadow-md z-10">
            {statuses.map((s) => (
                <div key={s} className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                {s}
                </div>
            ))}
            </div>
        )}
        </div>

      </div>

    </div>
  )
}

export default CalendarControls