"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt, fmtShort } from "@/lib/format";
import type { CategoryTrendPoint } from "@/lib/compute";

const PALETTE = [
  "#2a2520",
  "#8b5a3c",
  "#c2410c",
  "#8a7a60",
  "#5a5147",
  "#a0896e",
  "#d4a87a",
  "#6b4f3a",
];

type TipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
};

function Tip({ active, payload, label }: TipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div className="chart-tooltip">
      <div style={{ marginBottom: 4 }}>
        <span className="k" style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ float: "right", marginLeft: 16 }}>{fmt(total)}</span>
      </div>
      {payload.map((p) =>
        p.value > 0 ? (
          <div key={p.name}>
            <span className="k">{p.name}</span>
            <span style={{ color: p.color }}>{fmt(p.value)}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

type Props = {
  points: CategoryTrendPoint[];
  categories: string[];
};

export default function CategoryTrendsChart({ points, categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">07b — Spending by category, six months</div>
      </div>
      <div
        className="mt-6 hairline-t hairline-b"
        style={{ paddingTop: 12, paddingBottom: 12 }}
      >
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart
              data={points}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid stroke="#d8cdb8" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#2a2520", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                tickLine={false}
                axisLine={{ stroke: "#2a2520", strokeWidth: 0.5 }}
              />
              <YAxis
                tick={{ fill: "#5a5147", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtShort(Number(v))}
                width={54}
              />
              <Tooltip content={<Tip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              {categories.map((cat, i) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={PALETTE[i % PALETTE.length]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-5">
        {categories.map((cat, i) => (
          <span
            key={cat}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute"
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: PALETTE[i % PALETTE.length],
              }}
            />
            {cat}
          </span>
        ))}
      </div>
    </section>
  );
}
