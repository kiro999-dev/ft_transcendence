export interface ChecklistItem {
  label: string
  completed: boolean
}

export interface Visit {
  id: string
  day: number
  start: number
  duration: number
  title: string
  client: string
  status: string
  fullName: string
  phone: string
  location: string
  budget: string
  address: string
  note: string
  assignedAgent: string
  agentRole: string
  agentOnSite: boolean
  transitMinutes: number
  propertyImage: string
  propertyPrice: string
  propertyRef: string
  accessCode: string
  conciergeName: string
  checklist: ChecklistItem[]
  chauffeur: string
  iotPassStatus: string
  feedbackTriggerStatus: string
}

interface WeekCalendarProps {
  visits: Visit[]
  weekDates: Date[]
  onVisitClick: (visit: Visit) => void
}

function WeekCalendar({ visits, weekDates, onVisitClick }: WeekCalendarProps) {
  const ROW_HEIGHT = 56
  const TIME_COL_WIDTH = 60

  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  const isToday = (d: Date) => {
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  const hours = Array.from(
    { length: 11 },
    (_, index) => index + 8
  )

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-md">

      {/* WEEK HEADER */}
      <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-slate-200">

        <div className="h-14 border-r border-slate-200" />

        {weekDates.map((date, i) => (
          <div
            key={i}
            className={`h-14 flex flex-col items-center justify-center gap-0.5 border-r border-slate-200 ${
              isToday(date) ? "bg-blue-50" : ""
            }`}
          >
            <span className={`text-xs font-semibold ${isToday(date) ? "text-blue-700" : "text-slate-500"}`}>
              {dayLabels[i]}
            </span>
            <span className={`text-[10px] ${isToday(date) ? "text-blue-600 font-bold" : "text-slate-400"}`}>
              {date.getDate()}
            </span>
          </div>
        ))}

      </div>

      {/* CALENDAR BODY */}
      <div className="relative">

        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] h-14"
          >

            {/* TIME */}
            <div
              className="border-r border-b border-slate-200
              text-xs text-slate-400 text-right pr-3 pt-2"
            >
              {String(hour).padStart(2, "0")}:00
            </div>

            {/* DAY CELLS */}
            {weekDates.map((date) => (
              <div
                key={date.toISOString()}
                className={`border-r border-b border-slate-100 ${isToday(date) ? "bg-blue-50/30" : ""}`}
              />
            ))}

          </div>
        ))}

        {/* VISITS */}
        {visits.map((visit) => (
          <div
            key={visit.id}
            onClick={() => onVisitClick(visit)}
            className={`absolute rounded-md p-2 text-xs cursor-pointer
              overflow-hidden border
              ${
                visit.status === "ACTIVE"
                  ? "bg-blue-600 text-white border-blue-600"
                  : visit.status === "PENDING"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-white text-slate-800 border-slate-200"
              }`}
            style={{
              top: `${(visit.start - 8) * ROW_HEIGHT}px`,
              left: `calc(${TIME_COL_WIDTH}px + ${visit.day} * ((100% - ${TIME_COL_WIDTH}px) / 7) + 4px)`,
              width: `calc((100% - ${TIME_COL_WIDTH}px) / 7 - 8px)`,
              height: `${visit.duration * ROW_HEIGHT - 8}px`
            }}
          >

            <div className="font-semibold truncate">
              {visit.status}
            </div>

            <div className="mt-1 font-medium truncate">
              {visit.title}
            </div>

            <div className="mt-1 opacity-70 truncate">
              {visit.client}
            </div>

            <div className="opacity-60 truncate">
              {visit.assignedAgent.split(" ")[0]} {visit.assignedAgent.split(" ")[1]?.[0]}.
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default WeekCalendar