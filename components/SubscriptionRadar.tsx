"use client";

import { fmt, fmtShort } from "@/lib/format";
import type { SubscriptionItem } from "@/lib/compute";

type Props = {
  subscriptions: SubscriptionItem[];
};

export default function SubscriptionRadar({ subscriptions }: Props) {
  if (subscriptions.length === 0) return null;

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">12 — Subscription radar</div>
        <div className="small-caps text-rule">
          {fmt(totalMonthly)}/mo · {subscriptions.length} active
        </div>
      </div>
      <p
        className="serif-italic text-mute mt-2"
        style={{ fontSize: 14, lineHeight: 1.5 }}
      >
        Recurring expense charges detected from your transaction history.
      </p>

      <div className="mt-6 rule-t">
        <div
          className="small-caps py-3 hairline-b grid gap-4"
          style={{ gridTemplateColumns: "1fr 90px 80px 100px" }}
        >
          <div>Subscription</div>
          <div className="text-right">Monthly</div>
          <div className="text-right">Months</div>
          <div className="text-right">Total paid</div>
        </div>

        {subscriptions.map((sub, i) => (
          <div
            key={i}
            className="hairline-b py-4 grid gap-4 items-baseline"
            style={{ gridTemplateColumns: "1fr 90px 80px 100px" }}
          >
            <div>
              <div
                className="text-ink"
                style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 500 }}
              >
                {sub.label}
              </div>
              <div className="small-caps mt-0.5">{sub.category}</div>
            </div>
            <div className="num text-right text-ink" style={{ fontSize: 13 }}>
              {fmt(sub.amount)}
            </div>
            <div className="num text-right text-mute" style={{ fontSize: 13 }}>
              {sub.monthsActive}
            </div>
            <div className="num text-right" style={{ fontSize: 13, color: "#c2410c" }}>
              {fmtShort(sub.totalSpent)}
            </div>
          </div>
        ))}

        <div
          className="py-4 grid gap-4 items-baseline"
          style={{ gridTemplateColumns: "1fr 90px 80px 100px" }}
        >
          <div className="small-caps">Total</div>
          <div className="num text-right text-ink" style={{ fontSize: 13, fontWeight: 600 }}>
            {fmt(totalMonthly)}
          </div>
          <div />
          <div className="num text-right" style={{ fontSize: 13, color: "#c2410c", fontWeight: 600 }}>
            {fmtShort(subscriptions.reduce((s, sub) => s + sub.totalSpent, 0))}
          </div>
        </div>
      </div>
    </section>
  );
}
