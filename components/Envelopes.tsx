"use client";

import { fmt, fmtShort } from "@/lib/format";
import type { CategoryStat } from "@/lib/compute";

type Props = {
  stats: CategoryStat[];
  onEditBudget: (cat: string, value: number) => void;
  onDive: (cat: string) => void;
};

export default function Envelopes({ stats, onEditBudget, onDive }: Props) {
  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">08 — Envelopes</div>
        <div className="small-caps text-rule">
          Solid tick: budget · Dashed: 3-mo avg
        </div>
      </div>

      <div className="mt-6 rule-t">
        {stats.map((s) => (
          <Row
            key={s.category}
            stat={s}
            onEditBudget={(v) => onEditBudget(s.category, v)}
            onDive={() => onDive(s.category)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
          <Swatch color="#8b5a3c" /> Within budget
          <Swatch color="#c2410c" /> Over budget
        </div>
        <div className="serif-italic text-mute" style={{ fontSize: 13 }}>
          click a name for analysis
        </div>
      </div>
    </section>
  );
}

function Swatch({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden
        style={{ width: 16, height: 6, background: color, display: "inline-block" }}
      />
    </span>
  );
}

function Row({
  stat,
  onEditBudget,
  onDive,
}: {
  stat: CategoryStat;
  onEditBudget: (v: number) => void;
  onDive: () => void;
}) {
  const pctOfBudget = stat.budget > 0 ? Math.min(200, (stat.spent / stat.budget) * 100) : 0;
  const over = stat.budget > 0 && stat.spent > stat.budget;
  const axisMax = Math.max(stat.budget * 1.25, stat.spent * 1.1, stat.avg3 * 1.2, 1000);
  const spentPct = (stat.spent / axisMax) * 100;
  const budgetPct = stat.budget > 0 ? (stat.budget / axisMax) * 100 : null;
  const avgPct = stat.avg3 > 0 ? (stat.avg3 / axisMax) * 100 : null;

  const trend = stat.trend;
  const trendNode =
    trend !== null && Math.abs(trend) >= 5 ? (
      <span
        className="num"
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: trend > 0 ? "#c2410c" : "#5a5147",
        }}
      >
        {trend > 0 ? "↑" : "↓"}
        {Math.abs(trend).toFixed(0)}%
      </span>
    ) : null;

  return (
    <div className="hairline-b py-5 grid items-center gap-4" style={{
      gridTemplateColumns: "minmax(110px,140px) 1fr 100px 100px 64px",
    }}>
      <div className="flex items-baseline gap-2">
        <button
          onClick={onDive}
          className="text-ink hover:text-accent tr-120 text-[14px]"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 500 }}
        >
          {stat.category}
        </button>
        {trendNode}
        <span className="small-caps" style={{ fontSize: 9 }}>
          {pctOfBudget ? pctOfBudget.toFixed(0) + "%" : ""}
        </span>
      </div>

      <div
        className="relative"
        style={{ height: 18 }}
      >
        <div
          className="absolute left-0 right-0"
          style={{
            top: 4,
            height: 10,
            background: "#ebe3d2",
          }}
        />
        <div
          className="absolute left-0 bar-tr"
          style={{
            top: 4,
            height: 10,
            width: spentPct + "%",
            background: over ? "#c2410c" : "#8b5a3c",
          }}
        />
        {budgetPct !== null ? (
          <div
            className="absolute"
            style={{
              top: 0,
              height: 18,
              left: `calc(${budgetPct}% - 0.75px)`,
              width: 1.5,
              background: "#2a2520",
            }}
            aria-label="budget"
          />
        ) : null}
        {avgPct !== null ? (
          <div
            className="absolute"
            style={{
              top: 0,
              height: 18,
              left: `calc(${avgPct}% - 0.5px)`,
              width: 1,
              borderLeft: "1px dashed #8a7a60",
            }}
            aria-label="3-mo avg"
          />
        ) : null}
      </div>

      <div className="num text-ink text-right" style={{ fontSize: 13 }}>
        {fmt(stat.spent)}
      </div>

      <div className="flex items-center justify-end gap-1">
        <span className="small-caps" style={{ fontSize: 9 }}>
          of
        </span>
        <input
          type="number"
          value={stat.budget}
          onChange={(e) => onEditBudget(parseInt(e.target.value || "0", 10))}
          className="num text-ink text-right hairline-b w-[70px] py-1"
          style={{ fontSize: 13 }}
        />
      </div>

      <div className="num text-right text-mute" style={{ fontSize: 11 }}>
        {stat.avg3 > 0 ? fmtShort(stat.avg3) : "—"}
      </div>
    </div>
  );
}
