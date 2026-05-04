"use client";

import { fmt, shortDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";

type Props = { items: Transaction[] };

export default function TopOutflows({ items }: Props) {
  return (
    <section className="pl-0 md:pl-10">
      <div className="small-caps">06 — Largest outflows</div>
      <ol className="mt-6 space-y-5">
        {items.length === 0 ? (
          <li className="serif-italic text-mute" style={{ fontSize: 15 }}>
            No outflows in this period.
          </li>
        ) : (
          items.map((t, i) => (
            <li
              key={t.id}
              className="flex items-baseline justify-between gap-4 hairline-b pb-4"
            >
              <div className="flex items-baseline gap-4 min-w-0">
                <span
                  className="num text-rule"
                  style={{ fontSize: 11 }}
                >
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <div
                    className="serif text-ink"
                    style={{ fontSize: 15, lineHeight: 1.3 }}
                  >
                    {t.note || t.category}
                  </div>
                  <div className="small-caps mt-1 text-rule">
                    {t.category} · {shortDate(t.date)}
                  </div>
                </div>
              </div>
              <span
                className="num text-ink whitespace-nowrap"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {fmt(t.amount)}
              </span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
