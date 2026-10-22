// import { createRoot } from 'react-dom/client'
import { useState } from "react"
import { initialVisits, agentsList, portfoliosList, statusesList, activeLocations, aiEngineActive, aiEngineStatusLabel } from './mockData'
// Keep this side-effect import while Vite processes the stylesheet.
// @ts-ignore Vite resolves CSS imports at build time.
import '../../index.css'
import CalendarHeader from './CalendarHeader'
import DaysGrid from './DaysGrid'
import StatCard from './StatCard'
import CalendarControls from './CalendarControls'
import WeekCalendar, { type Visit } from './WeekCalendar'
import VisitFlyout from './VisitFlyout'
import NewVisitModal from './NewVisitModal'
import VisitsList from './VisitsList'
import { Sidebar } from "../componenets/Sidebar"
import { useAuth } from "../../auth/AuthContext"
import { Loading } from "../../auth/ProtectedRout"


export function Calendar() {
  const today = new Date()

  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setselectedDay] = useState<number | null>(null)
  const [year, setYear] = useState(today.getFullYear())
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [view, setView] = useState("Week")
  const [showModal, setShowModal] = useState(false)
  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const [weekOffset, setWeekOffset] = useState(0)

const getWeekStart = (offset: number) => {
  const now = new Date()
  const day = now.getDay() // 0=Sunday, 1=Monday...
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

const weekStart = getWeekStart(weekOffset)

const weekDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(weekStart)
  d.setDate(weekStart.getDate() + i)
  return d
})

const weekEnd = weekDates[6]

const formatWeekRange = (start: Date, end: Date) => {
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${startStr} – ${endStr}`
}
  const [searchQuery, setSearchQuery] = useState("")
  const [visits, setVisits] = useState<Visit[]>(initialVisits)

  const totalDays = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const { user, isLoading } = useAuth()
  const userName = user ? `${user.first_name} ${user.last_name}` : ""
  const userEmail = user?.email ?? ""
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const changeMonth = (offset: number) => {
    const date = new Date(year, month + offset, 1)

    setMonth(date.getMonth())
    setYear(date.getFullYear())
  }

  const filteredVisits = visits.filter((visit) =>
    visit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visit.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = visits.filter((v) => v.status === "PENDING").length
  const confirmedCount = visits.filter((v) => v.status === "CONFIRMED" || v.status === "ACTIVE").length

  const hasConflict = (a: Visit, b: Visit) =>
    a.day === b.day && a.start < b.start + b.duration && b.start < a.start + a.duration

  let conflictsCount = 0
  for (let i = 0; i < visits.length; i++) {
    for (let j = i + 1; j < visits.length; j++) {
      if (hasConflict(visits[i], visits[j])) conflictsCount++
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeHref="/calendar" userName={userName} userEmail={userEmail} />

      {/* MAIN */}
      <main className="flex-1">

        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200">
          <div className="h-full flex items-center justify-between px-6">

            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties, leads, visits..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all duration-150 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px] text-slate-500">apartment</span>
            {activeLocations}
            <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            aiEngineActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
          }`}>
            <span className={`w-2 h-2 rounded-full ${aiEngineActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
            {aiEngineStatusLabel}
          </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                + New Visit
              </button>

              <button className="relative p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
              </button>

              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-medium">
                {initials}
              </div>
            </div>

          </div>
        </header>

        {/* CONTENT */}
        <section className="p-8">

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
          <span>Scheduling & Agent Dispatch</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600">Real-Time Visit Calendar</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Calendar & Site Visits
        </h2>

          <p className="mt-1 text-sm text-slate-500">
            Schedule and manage your property visits.
          </p>

          <div className="grid grid-cols-4 gap-4 mt-8">

            <StatCard
              title="Today's Visits"
              value={String(visits.length)}
              description={`${confirmedCount} Confirmed · ${pendingCount} Pending`}
            />

            <StatCard
              title="AI Auto-Booked"
              value="82%"
              description="Zero friction client matches"
            />

            <StatCard
              title="Pending Approvals"
              value={String(pendingCount)}
              description="Awaiting agent review"
            />

            <StatCard
              title="Transit & Conflicts"
              value={`${conflictsCount} Conflicts`}
              description="45m buffer"
            />

          </div>

          <CalendarControls view={view} setView={setView} />

          <div className="flex gap-4 items-start">
            <div className="flex-1">

              {view === "Week" && (
  <>
    <div className="flex items-center gap-2 mt-6">
      <button
        onClick={() => setWeekOffset(weekOffset - 1)}
        className="p-2 border border-slate-200 rounded-md hover:bg-slate-50"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <span className="text-sm font-semibold text-slate-700 min-w-[160px] text-center">
        {formatWeekRange(weekStart, weekEnd)}
      </span>

      <button
        onClick={() => setWeekOffset(weekOffset + 1)}
        className="p-2 border border-slate-200 rounded-md hover:bg-slate-50"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>

      <button
        onClick={() => setWeekOffset(0)}
        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-md hover:bg-slate-50"
      >
        TODAY
      </button>
    </div>

    <WeekCalendar
      visits={filteredVisits}
      weekDates={weekDates}
      onVisitClick={setSelectedVisit}
    />
  </>
)}

              {view === "Agenda" && (
                <div className="mt-6 bg-white border border-slate-200 rounded-md">
                  <VisitsList
                    visits={filteredVisits}
                    weekDays={weekDayLabels}
                    onVisitClick={setSelectedVisit}
                  />
                </div>
              )}

              {view === "Day" && (
                <div className="mt-6 bg-white border border-slate-200 rounded-md">
                  <VisitsList
                    visits={filteredVisits.filter((v) => v.day === 0)}
                    weekDays={weekDayLabels}
                    onVisitClick={setSelectedVisit}
                  />
                </div>
              )}

            </div>

            {selectedVisit && (
              <VisitFlyout visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
            )}
          </div>

          {view === "Month" && (
            <div className="mt-6 max-w-md bg-white border border-slate-200 rounded-md p-6">
              <CalendarHeader
                month={month}
                year={year}
                onPrevMonth={() => changeMonth(-1)}
                onNextMonth={() => changeMonth(1)}
              />
              <DaysGrid
                year={year}
                month={month}
                totalDays={totalDays}
                startDay={startDay}
                selectedDay={selectedDay}
                setSelectedDay={setselectedDay}
              />
            </div>
          )}

        </section>

      </main>

      {showModal && (
        <NewVisitModal
          onClose={() => setShowModal(false)}
          onSave={(newVisit) => {
            setVisits([...visits, newVisit])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}