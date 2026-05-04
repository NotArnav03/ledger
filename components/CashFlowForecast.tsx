"use client";

import { fmt } from "@/lib/format";
import type { ForecastResult } from "@/lib/compute";
import { monthLong } from "@/lib/format";

type Props = {
  forecast: ForecastResult;
  monthKey: string;
};

export default function CashFlowForecast({ forecast, monthKey }: Props) {
  const { loggedNet, pendingInflow, pendingOutflow, projectedNet, daysLeft, pendingItems } = forecast;
  const month = monthLong(monthKey);
  const hasPending = pendingItems.length > 0;
  const netPositive = projectedNet >= 0;
  const loggedPositive = loggedNet >= 0;

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">06b — Cash flow forecast</div>
        <div className="small-caps text-rule">{daysLeft} days left in {month}</div>
      </div>

      <div className="mt-6 rule-t grid gap-0" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Cell
          label="Logged so far"
          value={fmt(loggedNet)}
          sub={loggedNet >= 0 ? "Surplus" : "Deficit"}
          color={loggedPositive ? "#2d6a4f" : "#c2410c"}
          border
        />
        <Cell
          label="Recurring pending"
          value={hasPending ? `+${fmt(pendingInflow)} / −${fmt(pendingOutflow)}` : "—"}
          sub={hasPending ? `${pendingItems.length} item${pendingItems.length !== 1 ? "s" : ""}` : "Nothing scheduled"}
          color="#8a7a60"
          border
        />
        <Cell
          label={`Projected ${month} net`}
          value={fmt(projectedNet)}
          sub={netPositive ? "Expected surplus" : "Expected deficit"}
          color={netPositive ? "#2d6a4f" : "#c2410c"}
        />
      </div>

      {hasPending && (
        <div className="mt-4 hairline-t pt-4">
          <div className="small-caps mb-3">Recurring items still expected</div>
          <div className="flex flex-col gap-2">
            {pendingItems.map((item, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5"
                    style={{
                      background: item.type === "income" ? "#2d6a4f" : "#c2410c",
                      color: "#f4ede0",
                    }}
                  >
                    {item.type === "income" ? "In" : "Out"}
                  </span>
                  <span className="serif text-ink" style={{ fontSize: 14 }}>{item.label}</span>
                </div>
                <span
                  className="num"
                  style={{ fontSize: 13, color: item.type === "income" ? "#2d6a4f" : "#2a2520" }}
                >
                  {item.type === "income" ? "+" : "−"}{fmt(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Cell({
  label,
  value,
  sub,
  color,
  border,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div
      className="py-6 pr-6"
      style={{ borderRight: border ? "0.5px solid #c8bfae" : undefined }}
    >
      <div className="small-caps">{label}</div>
      <div className="num mt-2" style={{ fontSize: 22, fontWeight: 500, color, lineHeight: 1.2 }}>
        {value}
      </div>
      <div className="small-caps mt-1" style={{ fontSize: 9 }}>{sub}</div>
    </div>
  );
}
