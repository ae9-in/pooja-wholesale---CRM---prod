import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ children, className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-semibold transition",
        {
          "bg-brand-700 text-white hover:bg-brand-900": variant === "primary",
          "bg-slate-100 text-slate-700 hover:bg-slate-200": variant === "secondary",
          "bg-transparent text-slate-600 hover:bg-slate-100": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
