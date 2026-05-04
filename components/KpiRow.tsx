"use client";

import { fmt, fmtShort, monthShort } from "@/lib/format";
import { momDelta, type MonthTotals } from "@/lib/compute";

type Props = {
  current: MonthTotals;
  prior: MonthTotals;
  priorKey: string;
};

function DeltaNote({
  delta,
  direction,
  priorKey,
}: {
  delta: number | null;
  direction: "in" | "out";
  priorKey: string;
}) {
  if (delta === null || !isFinite(delta)) {
    return (
      <span className="small-caps" style={{ fontSize: 10 }}>
        — no prior
      </span>
    );
  }
  const sign = delta >= 0 ? "+" : "−";
  const val = Math.abs(delta).toFixed(0);
  const arrow = delta >= 0 ? "↑" : "↓";
  return (
    <span className="font-mono text-[10px] text-mute uppercase tracking-[0.12em]">
      <span className="num mr-1 text-ink">
        {arrow}
        {sign}
        {val}%
      </span>
      vs {monthShort(priorKey).toLowerCase()}
      <span className="ml-2 opacity-70">
        ({direction === "in" ? "inflow" : "outflow"})
      </span>
    </span>
  );
}

export default function KpiRow({ current, prior, priorKey }: Props) {
  const dIn = momDelta(current.inflow, prior.inflow);
  const dOut = momDelta(current.outflow, prior.outflow);

  const cells: Array<{
    label: string;
    value: string;
    accent?: boolean;
    note: React.ReactNode;
  }> = [
    {
      label: "01 — Inflow",
      value: fmt(current.inflow),
      note: <DeltaNote delta={dIn} direction="in" priorKey={priorKey} />,
    },
    {
      label: "02 — Outflow",
      value: fmt(current.outflow),
      note: <DeltaNote delta={dOut} direction="out" priorKey={priorKey} />,
    },
    {
      label: "03 — Net",
      value: fmt(current.net),
      accent: true,
      note: (
        <span className="small-caps" style={{ fontSize: 10 }}>
          {current.net >= 0 ? "Surplus" : "Deficit"} this period
        </span>
      ),
    },
    {
      label: "04 — Savings rate",
      value:
        current.inflow > 0
          ? current.savingsRate.toFixed(1) + "%"
          : "—",
      note: (
        <span className="font-mono text-[10px] text-mute uppercase tracking-[0.12em]">
          <span className="num text-ink mr-1">
            {fmtShort(Math.max(0, current.net))}
          </span>
          kept back
        </span>
      ),
    },
  ];

  return (
    <section className="mt-8 kpi-row">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cells.map((c, i) => (
          <div
            key={c.label}
            data-i={i}
            className="kpi-cell px-5 py-6"
          >
            <div className="small-caps">{c.label}</div>
            <div
              className="num mt-3"
              style={{
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: c.accent
                  ? current.net >= 0
                    ? "#2d6a4f"
                    : "#c2410c"
                  : "#2a2520",
              }}
            >
              {c.value}
            </div>
            <div className="mt-2">{c.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
