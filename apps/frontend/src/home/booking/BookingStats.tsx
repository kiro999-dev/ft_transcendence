import type { Visit } from "./bookingApi";

type BookingStatsProps = { visits: Visit[] };

export function BookingStats({ visits }: BookingStatsProps) {
  const count = (status: string) => visits.filter((visit) => visit.status.toLowerCase() === status).length;
  const cards = [
    ["Today's visits", count("confirmed"), "Scheduled"],
    ["AI auto-booked", `${visits.length ? Math.round((count("confirmed") / visits.length) * 100) : 0}%`, "Autonomous"],
    ["Pending approvals", count("pending"), "Requests"],
    ["Cancelled", count("cancelled"), "Records"],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, note]) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{note} · live booking data</p>
        </div>
      ))}
    </section>
  );
}
