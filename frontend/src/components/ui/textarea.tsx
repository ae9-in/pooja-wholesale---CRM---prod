import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500",
        props.className,
      )}
    />
  );
}
