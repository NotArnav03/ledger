"use client";

import { signOut, useSession } from "next-auth/react";
import { monthLong, spellYear } from "@/lib/format";
import MonthPicker from "./ui/MonthPicker";

type Props = {
  monthKey: string;
  monthOptions: string[];
  onMonthChange: (mk: string) => void;
  entryCount: number;
  onAdd: () => void;
};

export default function Header({
  monthKey,
  monthOptions,
  onMonthChange,
  entryCount,
  onAdd,
}: Props) {
  const { data: session } = useSession();
  const [year] = monthKey.split("-");
  return (
    <header className="rule-b pb-6">
      <div className="small-caps flex items-center justify-between">
        <span>Ledger — Personal Finance, Observed</span>
        <span className="hidden md:inline-flex items-center gap-4">
          {session?.user?.email && <span>{session.user.email}</span>}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-rule hover:text-accent tr-120"
          >
            Sign out
          </button>
        </span>
      </div>
      <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1
            className="serif text-ink"
            style={{
              fontSize: "clamp(36px, 6vw, 52px)",
              fontWeight: 400,
              letterSpacing: "-0.025em",
              lineHeight: 1.02,
            }}
          >
            {monthLong(monthKey)}
          </h1>
          <div
            className="serif-italic text-mute mt-1"
            style={{ fontSize: 18 }}
          >
            {spellYear(year)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <MonthPicker
            value={monthKey}
            options={monthOptions}
            onChange={onMonthChange}
          />
          <span className="font-mono text-[11px] text-mute">
            <span className="small-caps mr-2">Entries</span>
            <span className="num text-ink">
              {entryCount.toString().padStart(3, "0")}
            </span>
          </span>
          <span className="font-mono text-[11px] text-mute inline-flex items-center gap-2">
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                background: "#c2410c",
              }}
            />
            Private, local
          </span>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-3 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            + Entry
            <span className="text-[10px] opacity-60">[A]</span>
          </button>
        </div>
      </div>
    </header>
  );
}
