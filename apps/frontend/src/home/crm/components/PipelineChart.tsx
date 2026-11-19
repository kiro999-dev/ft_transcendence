type Stage = {
  label: string;
  count: number;
  color: string;
};

export function PipelineChart({ stages }: { stages: Stage[] }) {
  const biggest = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="font-semibold text-slate-900">Pipeline</p>
      <p className="mt-1 text-xs text-slate-500">How many leads are at each stage</p>

      <div className="mt-6 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-slate-600">{stage.label}</span>
              <span className="font-bold text-slate-900">{stage.count}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full ${stage.color}`}
                style={{ width: `${(stage.count / biggest) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
