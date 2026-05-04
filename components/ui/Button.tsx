"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "outline" | "solid" | "accent-outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export default function Button({
  variant = "outline",
  children,
  className = "",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] tr-120 disabled:opacity-40 disabled:cursor-not-allowed";
  let v = "";
  if (variant === "outline") {
    v =
      "border border-[0.5px] border-ink text-ink hover:bg-ink hover:text-paper";
  } else if (variant === "solid") {
    v = "bg-ink text-paper hover:bg-accent";
  } else if (variant === "accent-outline") {
    v =
      "border border-[0.5px] border-accent text-accent hover:bg-accent hover:text-paper";
  }
  return (
    <button className={`${base} ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}
