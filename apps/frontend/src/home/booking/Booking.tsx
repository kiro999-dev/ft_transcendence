import { useState } from "react";

export const Booking = () => {
  const [selectedDate, setSelectedDate] = useState("Mon");
  const [currentWeek, setCurrentWeek] = useState(new Date(2026, 10, 9));
  const weekEnd = new Date(currentWeek);
  weekEnd.setDate(currentWeek.getDate() + 6);
  const days = Array.from({ length: 7 }, (_, index) => {
  const date = new Date(currentWeek);
  date.setDate(currentWeek.getDate() + index);
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.getDate(),
    bookings: Math.floor(Math.random() * 6) // Random bookings for demonstration
  };
});
  const selectedDay = days.find(day => day.day === selectedDate);
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Booking
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your bookings and upcoming visits.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            + New Booking
          </button>
        </div>

        {/* Booking Content */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block">Pending</p>
            <h2 className="text-2xl font-bold text-slate-900">3</h2>
            <p className="mt-2 text-xs text-slate-500">Awaiting confirmation</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md inline-block">Confirmed</p>
            <h2 className="text-2xl font-bold text-slate-900">5</h2>
            <p className="mt-2 text-xs text-slate-500">Successfully booked</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md inline-block">Canceled</p>
            <h2 className="text-2xl font-bold text-slate-900">2</h2>
            <p className="mt-2 text-xs text-slate-500">Booking cancelled</p>
          </div>
          {/* We'll build this section next */}
        </div>
        <div className="bg-white rounded-lg shadow-sm mt-6 p-5 border border-slate-200">
          {/* header booking calendar*/}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Booking Calendar</h2>
            <div className="text-sm text-slate-500 mt-1">
            <p>{currentWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2">
            <button className="border border-slate-200 rounded-xl p-2 hover:bg-slate-50"onClick={() => {
              const previousWeek = new Date(currentWeek);
              previousWeek.setDate(currentWeek.getDate() - 7);
              setCurrentWeek(previousWeek);
            }}>&lt;&lt;</button>
            <button className="border border-slate-200 rounded-xl p-2 hover:bg-slate-50"onClick={() => {
              const nextWeek = new Date(currentWeek);
              nextWeek.setDate(currentWeek.getDate() + 7);
              setCurrentWeek(nextWeek);
            }}>&gt;&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {days.map((day) => (
              <div
                key={day.day}
                onClick={() => setSelectedDate(day.day)}
                className={`rounded-lg border p-4 text-center cursor-pointer ${
                  selectedDate === day.day
                    ? "border-blue-500 bg-blue-100"
                    : "border-slate-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-500">{day.day}</p>
                <p className="text-lg font-bold text-slate-900">{day.date}</p>
                <p className="mt-1 text-xs text-slate-500">{day.bookings} bookings</p>
              </div>
            ))}
          </div>
            {selectedDate && (
              <div className="col-span-7 mt-4 p-4 border rounded-lg bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-900">Bookings for {selectedDate}</h3>
                <p className="mt-1 text-xs text-slate-500">You have {selectedDay?.bookings} bookings on this day.</p>
              </div>
            )}
        </div>

      </div>
    </div>
  );
};