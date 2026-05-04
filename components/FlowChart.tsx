"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt, fmtShort } from "@/lib/format";
import type { FlowPoint } from "@/lib/compute";

type Props = { data: FlowPoint[] };

type TipProps = {
  active?: boolean;
  payload?: Array<{ payload: FlowPoint }>;
};

function Tip({ active, payload }: TipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div>
        <span className="k">In</span>
        <span>{fmt(p.inflow)}</span>
      </div>
      <div>
        <span className="k">Out</span>
        <span>{fmt(p.outflow)}</span>
      </div>
      <div>
        <span className="k">Net</span>
        <span>{fmt(p.inflow - p.outflow)}</span>
      </div>
    </div>
  );
}

export default function FlowChart({ data }: Props) {
  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">07 — Flow, six months</div>
        <div className="small-caps text-rule">
          Ink: inflow · Dashed: outflow
        </div>
      </div>
      <div
        className="mt-6 hairline-t hairline-b"
        style={{ paddingTop: 12, paddingBottom: 12 }}
      >
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#d8cdb8"
                strokeDasharray="0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{
                  fill: "#2a2520",
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono",
                }}
                tickLine={false}
                axisLine={{ stroke: "#2a2520", strokeWidth: 0.5 }}
              />
              <YAxis
                tick={{
                  fill: "#5a5147",
                  fontSize: 10,
                  fontFamily: "IBM Plex Mono",
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtShort(Number(v))}
                width={54}
              />
              <Tooltip
                content={<Tip />}
                cursor={{ stroke: "#8a7a60", strokeWidth: 0.5 }}
              />
              <Line
                type="linear"
                dataKey="inflow"
                stroke="#2a2520"
                strokeWidth={1.5}
                dot={{ r: 3, fill: "#2a2520", stroke: "#2a2520" }}
                activeDot={{ r: 5, fill: "#2a2520", stroke: "#2a2520" }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="outflow"
                stroke="#c2410c"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: "#c2410c", stroke: "#c2410c" }}
                activeDot={{ r: 5, fill: "#c2410c", stroke: "#c2410c" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-6">
        <LegendSwatch dashed={false} label="Inflow" color="#2a2520" />
        <LegendSwatch dashed label="Outflow" color="#c2410c" />
      </div>
    </section>
  );
}

function LegendSwatch({
  label,
  color,
  dashed,
}: {
  label: string;
  color: string;
  dashed: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
      <svg width={24} height={8} aria-hidden>
        <line
          x1={0}
          y1={4}
          x2={24}
          y2={4}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashed ? "4 2" : undefined}
        />
      </svg>
      {label}
    </span>
  );
}
