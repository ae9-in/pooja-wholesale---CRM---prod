import { Card } from "./ui/card";

export function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </Card>
  );
}
