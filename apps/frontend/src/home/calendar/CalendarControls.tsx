interface CalendarControlsProps {
  view: string
  setView: (view: string) => void
}

export default function CalendarControls({ view, setView }: CalendarControlsProps) {
  return (
    <div className="mt-6 flex gap-2">
      {['Day', 'Week', 'Month', 'Agenda'].map(item => (
        <button key={item} onClick={() => setView(item)}
          className={`rounded px-4 py-2 text-sm ${view === item ? 'bg-blue-600 text-white' : 'border bg-white text-slate-700'}`}>
          {item}
        </button>
      ))}
    </div>
  )
}
