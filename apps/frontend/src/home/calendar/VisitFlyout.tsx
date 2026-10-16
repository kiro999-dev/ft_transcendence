import type { Visit } from "./WeekCalendar"

interface VisitFlyoutProps {
  visit: Visit
  onClose: () => void
}

function VisitFlyout({ visit, onClose }: VisitFlyoutProps) {
  const initials = visit.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")

  return (
    <div className="w-80 bg-white border border-slate-200 rounded-md p-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {visit.status}
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-sm"
        >
          ✕
        </button>
      </div>

      {/* BUYER PROFILE */}
      <div className="mt-4 p-3 rounded-md bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {visit.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              {visit.phone} • {visit.location}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
          <span className="text-slate-500">Budget:</span>
          <span className="font-bold text-blue-700">{visit.budget}</span>
        </div>

        <p className="text-xs text-slate-600">{visit.note}</p>
      </div>

      {/* PROPERTY */}
      <div className="mt-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Property
        </span>
        <div className="mt-2 p-3 rounded-md border border-slate-200 bg-slate-50">
          <h4 className="text-sm font-bold text-slate-900">{visit.title}</h4>
          <p className="text-xs text-slate-500 mt-1">{visit.address}</p>
        </div>
      </div>

    </div>
  )
}

export default VisitFlyout