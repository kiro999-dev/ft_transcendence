import { ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  note: string;
};

export function StatCard({ title, value, note }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <span className="grid h-6 w-9 place-items-center rounded-full border border-slate-300">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <p className="mt-4 text-4xl font-bold">{value}</p>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
    </div>
  );
}
