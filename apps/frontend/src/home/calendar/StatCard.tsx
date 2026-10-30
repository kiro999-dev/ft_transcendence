import React from "react"

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({
  title,
  value,
  description
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5">

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  )
}

export default StatCard