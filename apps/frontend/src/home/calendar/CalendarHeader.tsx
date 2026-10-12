import React from "react";


interface CalendarHeaderProps{
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}
function CalendarHeader({month, year, onPrevMonth, onNextMonth}: CalendarHeaderProps)
{
  const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
  const currentMonthName = monthNames[month];
  return(
    <div className="flex items-center justify-between mb-6">
      <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">◀</button>
      <p className="text-xl font-bold text-gray-800">{currentMonthName} {year}</p>
      <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">▶</button>
    </div>
  )

}

export default CalendarHeader;