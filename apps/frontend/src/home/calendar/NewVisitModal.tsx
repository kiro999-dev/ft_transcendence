import { useState } from "react"
import type { Visit } from "./WeekCalendar"

interface NewVisitModalProps {
  onSave: (visit: Visit) => void
  onClose: () => void
}

function NewVisitModal({ onSave, onClose }: NewVisitModalProps) {
  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [day, setDay] = useState(0)
  const [start, setStart] = useState(9)
  const [duration, setDuration] = useState(1)

  const weekDayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleSave = () => {
  const newVisit: Visit = {
        id: crypto.randomUUID(),
        day,
        start,
      duration,
      title,
      client: fullName.split(" ")[0] + "...",
      status: "PENDING",
      fullName,
      phone: "—",
      location: "—",
      budget: "—",
      address: "—",
      note: "Added manually from the dashboard."
    }
    onSave(newVisit)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-96">

        <h3 className="text-lg font-bold text-slate-900 mb-4">
          New Visit
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Client name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Property</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
            >
              {weekDayOptions.map((label, index) => (
                <option key={label} value={index}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500">Start hour</label>
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(Number(e.target.value))}
                className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500">Duration (h)</label>
              <input
                type="number"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full mt-1 border border-slate-200 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}

export default NewVisitModal