"use client";

import { fmt } from "@/lib/format";
import type { Goal, Transaction } from "@/lib/types";
import { computeGoalSaved, goalEta } from "@/lib/compute";

type Props = {
  goals: Goal[];
  txs: Transaction[];
  monthlyNet: number;
  onAdd: () => void;
  onDelete: (id: string) => void;
};

export default function Goals({
  goals,
  txs,
  monthlyNet,
  onAdd,
  onDelete,
}: Props) {
  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">09 — Goals</div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
        >
          + Goal
        </button>
      </div>

      <div className="mt-6 rule-t">
        {goals.length === 0 ? (
          <div className="py-10 serif-italic text-mute" style={{ fontSize: 15 }}>
            No goals yet. A blank horizon.
          </div>
        ) : (
          goals.map((g) => (
            <Row
              key={g.id}
              goal={g}
              saved={computeGoalSaved(g, txs)}
              monthlyNet={monthlyNet}
              onDelete={() => onDelete(g.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function Row({
  goal,
  saved,
  monthlyNet,
  onDelete,
}: {
  goal: Goal;
  saved: number;
  monthlyNet: number;
  onDelete: () => void;
}) {
  const pct = Math.min(100, (saved / goal.target) * 100);
  const done = saved >= goal.target;
  const remaining = Math.max(0, goal.target - saved);
  const eta =
    monthlyNet > 0 && !done
      ? goalEta(remaining, monthlyNet)
      : done
      ? "Reached"
      : "Negative cashflow — no ETA";

  return (
    <div className="hairline-b py-5 grid gap-4" style={{ gridTemplateColumns: "1fr 180px 120px 28px" }}>
      <div>
        <div
          className="text-ink"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {goal.name}
        </div>
        <div className="small-caps mt-1">
          Target {goal.deadline}
        </div>
        <div className="mt-3" style={{ height: 6, background: "#d8cdb8" }}>
          <div
            className="bar-tr"
            style={{
              height: 6,
              width: pct + "%",
              background: done ? "#8b5a3c" : "#2a2520",
            }}
          />
        </div>
      </div>

      <div className="flex items-baseline justify-end gap-2">
        <span className="num text-ink" style={{ fontSize: 14 }}>
          {fmt(saved)}
        </span>
        <span className="small-caps">of {fmt(goal.target)}</span>
      </div>

      <div className="text-right serif-italic text-mute self-center" style={{ fontSize: 13 }}>
        {eta}
      </div>

      <button
        onClick={onDelete}
        className="text-rule hover:text-accent tr-120 self-center text-[14px]"
        aria-label="Delete goal"
      >
        ×
      </button>
    </div>
  );
}
