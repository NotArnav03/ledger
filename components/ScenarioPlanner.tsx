"use client";

import { useState, useMemo } from "react";
import { fmt, fmtShort } from "@/lib/format";
import { applyScenario, goalEta } from "@/lib/compute";
import type { ScenarioBase } from "@/lib/compute";
import type { Goal } from "@/lib/types";

type Props = {
  base: ScenarioBase;
  goals: Goal[];
  txs: Array<{ date: string; type: string; amount: number }>;
};

export default function ScenarioPlanner({ base, goals, txs }: Props) {
  const categories = Object.keys(base.avgByCategory).sort();
  const [adj, setAdj] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c, 0]))
  );
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenario = useMemo(() => applyScenario(base, adj), [base, adj]);

  const netDelta = scenario.net - base.avgNet;
  const netPositive = scenario.net >= 0;

  function reset() {
    setAdj(Object.fromEntries(categories.map((c) => [c, 0])));
    setAnalysis(null);
    setError(null);
  }

  function goalEtaFor(goal: Goal, monthlyNet: number): string {
    const saved = Math.max(
      0,
      txs
        .filter((t) => t.date >= goal.createdAt)
        .reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0)
    );
    const remaining = Math.max(0, goal.target - saved);
    if (remaining === 0) return "Reached";
    if (monthlyNet <= 0) return "No ETA";
    return goalEta(remaining, monthlyNet);
  }

  async function analyse() {
    setError(null);
    setLoading(true);
    try {
      const goalPayload = goals.map((g) => ({
        name: g.name,
        target: g.target,
        baseEta: goalEtaFor(g, base.avgNet),
        newEta: goalEtaFor(g, scenario.net),
      }));
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avgInflow: base.avgInflow,
          baseNet: base.avgNet,
          newNet: scenario.net,
          adjustments: adj,
          avgByCategory: base.avgByCategory,
          newByCategory: scenario.byCategory,
          goals: goalPayload,
        }),
      });
      const j = await res.json();
      if (!res.ok) { setError(j.error || "Analysis failed."); return; }
      setAnalysis(j.text);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  const hasAdjustment = categories.some((c) => adj[c] !== 0);

  if (categories.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">11 — What if?</div>
        {hasAdjustment && (
          <button onClick={reset} className="small-caps text-rule hover:text-accent tr-120">
            Reset
          </button>
        )}
      </div>
      <p
        className="serif-italic text-mute mt-2"
        style={{ fontSize: 14, lineHeight: 1.5 }}
      >
        Adjust your average monthly spending per category and see the impact on
        savings and goals.
      </p>

      <div className="mt-6 rule-t">
        {categories.map((cat) => {
          const avg = base.avgByCategory[cat] ?? 0;
          const pct = adj[cat] ?? 0;
          const adjusted = Math.max(0, avg * (1 + pct / 100));
          const saved = avg - adjusted;
          return (
            <div key={cat} className="hairline-b py-4 grid gap-4 items-center"
              style={{ gridTemplateColumns: "130px 1fr 90px 90px" }}>
              <div
                className="text-ink"
                style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 500 }}
              >
                {cat}
                <div className="small-caps mt-0.5">avg {fmtShort(avg)}/mo</div>
              </div>

              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min={-80}
                  max={50}
                  step={5}
                  value={pct}
                  onChange={(e) =>
                    setAdj((prev) => ({ ...prev, [cat]: Number(e.target.value) }))
                  }
                  className="w-full accent-ink"
                  style={{ accentColor: pct < 0 ? "#2d6a4f" : pct > 0 ? "#c2410c" : "#2a2520" }}
                />
                <div className="flex justify-between small-caps" style={{ fontSize: 9 }}>
                  <span>−80%</span>
                  <span>0</span>
                  <span>+50%</span>
                </div>
              </div>

              <div className="text-right">
                <div
                  className="num"
                  style={{ fontSize: 13, color: pct < 0 ? "#2d6a4f" : pct > 0 ? "#c2410c" : "#2a2520" }}
                >
                  {pct !== 0 ? (pct > 0 ? "+" : "") + pct + "%" : "—"}
                </div>
                <div className="num text-mute" style={{ fontSize: 11 }}>
                  {pct !== 0 ? fmt(adjusted) : ""}
                </div>
              </div>

              <div className="text-right">
                {saved !== 0 ? (
                  <div
                    className="num"
                    style={{ fontSize: 13, color: saved > 0 ? "#2d6a4f" : "#c2410c" }}
                  >
                    {saved > 0 ? "+" : "−"}{fmtShort(Math.abs(saved))}
                  </div>
                ) : (
                  <div className="num text-mute" style={{ fontSize: 13 }}>—</div>
                )}
                <div className="small-caps" style={{ fontSize: 9 }}>
                  {saved > 0 ? "freed" : saved < 0 ? "extra" : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-0 hairline-t" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="py-5 hairline-r pr-6">
          <div className="small-caps">Adjusted monthly net</div>
          <div
            className="num mt-2"
            style={{ fontSize: 28, fontWeight: 500, color: netPositive ? "#2d6a4f" : "#c2410c" }}
          >
            {fmt(scenario.net)}
          </div>
          <div className="small-caps mt-1" style={{ fontSize: 9 }}>
            {netDelta >= 0 ? "+" : ""}
            {fmt(netDelta)} vs current avg
          </div>
        </div>

        <div className="py-5 pl-6">
          <div className="small-caps">Goal ETAs</div>
          {goals.length === 0 ? (
            <div className="serif-italic text-mute mt-2" style={{ fontSize: 13 }}>No goals set.</div>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {goals.map((g) => {
                const baseE = goalEtaFor(g, base.avgNet);
                const newE = goalEtaFor(g, scenario.net);
                const changed = hasAdjustment && baseE !== newE;
                return (
                  <div key={g.id} className="flex items-baseline justify-between gap-4">
                    <span className="serif text-ink" style={{ fontSize: 13 }}>{g.name}</span>
                    <span className="num text-right" style={{ fontSize: 12 }}>
                      {changed ? (
                        <>
                          <span className="text-rule line-through mr-2" style={{ fontSize: 11 }}>{baseE}</span>
                          <span style={{ color: "#2d6a4f" }}>{newE}</span>
                        </>
                      ) : (
                        <span className="text-mute">{baseE}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI analysis */}
      <div className="mt-6">
        <button
          onClick={analyse}
          disabled={loading}
          className="px-4 py-2 bg-ink text-paper hover:bg-accent tr-120 font-mono text-[11px] uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {loading ? "Analysing…" : "Analyse with AI ↵"}
        </button>

        {error && (
          <div className="mt-3 serif-italic" style={{ color: "#c2410c", fontSize: 13 }}>
            {error}
          </div>
        )}

        {analysis && !loading && (
          <div
            className="mt-5 serif text-ink"
            style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 680 }}
          >
            {analysis}
          </div>
        )}
      </div>
    </section>
  );
}
