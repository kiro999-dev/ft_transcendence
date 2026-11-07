import { statusColors } from "./leadUtils";

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        statusColors[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}
