import React from "react"

interface DaysGridProps{
    year:number;
    month:number;
    totalDays:number;
    startDay:number;
    selectedDay: number | null;
    setSelectedDay: (day: number) => void;
}

function DaysGrid({ year, month, totalDays, startDay, selectedDay, setSelectedDay}: DaysGridProps) {
    const emptyDays = Array(startDay).fill(null);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const daysarray = Array.from({ length: totalDays }, (_, index) => index + 1)
    const allCells = [...emptyDays, ...daysarray];
    return (
        <>
        <div className="text-center text-sm font-semibold text-gray-400 pb-2">
        <div className="grid grid-cols-7">
                {weekDays.map((cell, index) => (
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{cell}</div>
                ))}
        </div>
        </div>
        <div className="grid grid-cols-7">
                {allCells.map((cell, index) => (
                    cell === null ? <div key={index}></div> : <div key={index} onClick={() => setSelectedDay(cell)} className={`h-10 w-10 mx-auto flex items-center justify-center rounded cursor-pointer text-sm font-medium transition-all ${cell === selectedDay ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-900 hover:bg-slate-100"}`}>{cell}</div>
                ))}
        </div>
        </>
    )
}

export default DaysGrid;