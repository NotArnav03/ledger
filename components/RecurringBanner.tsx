"use client";

import type { Transaction } from "@/lib/types";
import { monthLong } from "@/lib/format";

type Props = {
  added: Transaction[];
  monthKey: string;
  onDismiss: () => void;
};

export default function RecurringBanner({ added, monthKey, onDismiss }: Props) {
  if (added.length === 0) return null;
  const month = monthLong(monthKey);
  return (
    <div
      className="flex items-center justify-between gap-6 px-5 py-3 hairline-b"
      style={{ background: "#f0e8d8", fontSize: 12 }}
    >
      <span className="font-mono uppercase tracking-[0.12em] text-[10px] text-ink">
        {added.length} recurring{" "}
        {added.length === 1 ? "entry" : "entries"} auto-added for {month}
        {" — "}
        <span className="serif-italic text-mute" style={{ textTransform: "none", letterSpacing: 0 }}>
          {added.map((t) => t.note || t.category).join(", ")}
        </span>
      </span>
      <button
        onClick={onDismiss}
        className="small-caps text-rule hover:text-accent tr-120 shrink-0"
      >
        Dismiss
      </button>
    </div>
  );
}
