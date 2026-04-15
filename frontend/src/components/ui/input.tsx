import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-brand-500",
        props.className,
      )}
    />
  );
}
