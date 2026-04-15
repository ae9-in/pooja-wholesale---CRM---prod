import clsx from "clsx";

export function Badge({ value }: { value: string }) {
  const tone =
    value.includes("OVERDUE") || value.includes("CANCELLED") || value.includes("NOT_DELIVERED")
      ? "bg-red-100 text-red-700"
      : value === "DONE" || value === "DELIVERED"
        ? "bg-emerald-100 text-emerald-700"
        : value.includes("UPCOMING") || value.includes("QUOTED")
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-100 text-slate-700";

  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", tone)}>{value}</span>;
}
