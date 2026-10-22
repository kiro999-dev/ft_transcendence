import type { Visit } from './WeekCalendar'

interface VisitsListProps {
  visits: Visit[]
  weekDays: string[]
  onVisitClick: (visit: Visit) => void
}

function VisitsList({ visits, weekDays, onVisitClick }: VisitsListProps) {
  const sorted = [...visits].sort((a, b) => a.day - b.day || a.start - b.start)

  if (sorted.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-slate-400">
        No visits for this view.
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100">
      {sorted.map((visit) => (
        <div
            key={visit.id}
            onClick={() => onVisitClick(visit)}
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{visit.title}</p>
            <p className="text-xs text-slate-500">{visit.fullName}</p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-slate-600">
              {weekDays[visit.day]} · {String(Math.floor(visit.start)).padStart(2, "0")}:{visit.start % 1 === 0 ? "00" : "30"}
            </p>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                visit.status === "ACTIVE"
                  ? "bg-blue-100 text-blue-700"
                  : visit.status === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {visit.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default VisitsList