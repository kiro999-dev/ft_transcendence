type InsightCardProps = {
  title: string;
  text: string;
};

export function InsightCard({ title, text }: InsightCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-[11px] text-slate-500">{text}</p>
    </div>
  );
}
