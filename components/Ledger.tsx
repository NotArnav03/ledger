"use client";

import { fmt, shortDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { monthKey as mk } from "@/lib/format";

type Props = {
  transactions: Transaction[];
  monthKey: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onLoadExample: () => void;
  totalEntries: number;
};

export default function Ledger({
  transactions,
  monthKey,
  onEdit,
  onDelete,
  onAdd,
  onLoadExample,
  totalEntries,
}: Props) {
  const rows = transactions
    .filter((t) => mk(t.date) === monthKey)
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : b.date.localeCompare(a.date)));

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">10 — The ledger</div>
        <div className="small-caps text-rule">
          {rows.length.toString().padStart(3, "0")} entries
        </div>
      </div>

      <div className="mt-6 rule-t">
        <div
          className="small-caps py-3 hairline-b grid gap-4"
          style={{
            gridTemplateColumns: "80px 70px 110px 1fr 120px 32px",
          }}
        >
          <div>Date</div>
          <div>Type</div>
          <div>Category</div>
          <div>Note</div>
          <div className="text-right">Amount</div>
          <div />
        </div>

        {rows.length === 0 ? (
          <div className="py-10">
            <div className="serif-italic text-mute" style={{ fontSize: 15 }}>
              {totalEntries === 0
                ? "A blank ledger. Record your first line, or load the example data to see the dashboard at work."
                : "Awaiting first entry in this month."}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-3 py-2 bg-ink text-paper tr-120 hover:bg-accent font-mono text-[11px] uppercase tracking-[0.12em]"
              >
                + New entry <span className="opacity-60">[A]</span>
              </button>
              {totalEntries === 0 ? (
                <button
                  onClick={onLoadExample}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
                >
                  Load example <span>↳</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          rows.map((t) => (
            <div
              key={t.id}
              className="ledger-row hairline-b py-3 grid gap-4 items-baseline cursor-pointer hover:bg-paper-2 tr-120"
              style={{
                gridTemplateColumns: "80px 70px 110px 1fr 120px 32px",
              }}
              onClick={() => onEdit(t)}
            >
              <div className="num text-ink" style={{ fontSize: 12 }}>
                {shortDate(t.date)}
              </div>
              <div className="small-caps">
                {t.type === "income" ? "In" : "Out"}
              </div>
              <div
                className="text-ink"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 13,
                }}
              >
                {t.category}
                {t.recurring ? (
                  <span className="text-rule ml-2">∞</span>
                ) : null}
              </div>
              <div
                className="serif text-ink truncate"
                style={{ fontSize: 14, lineHeight: 1.3 }}
              >
                {t.note || <span className="text-mute">—</span>}
              </div>
              <div
                className="num text-right"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: t.type === "income" ? "#8b5a3c" : "#2a2520",
                }}
              >
                {t.type === "income" ? "+" : "−"}
                {fmt(t.amount).replace("₹", "₹")}
              </div>
              <button
                className="tx-del text-rule hover:text-accent tr-120 text-right"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                aria-label="Delete transaction"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
