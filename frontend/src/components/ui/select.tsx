import type { PropsWithChildren, SelectHTMLAttributes } from "react";
import clsx from "clsx";

export function Select({ children, className, ...props }: PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement>>) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500",
        className,
      )}
    >
      {children}
    </select>
  );
}
