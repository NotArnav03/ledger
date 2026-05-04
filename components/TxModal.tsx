"use client";

import { useEffect, useState } from "react";
import type { Transaction, TxType } from "@/lib/types";
import { EXPENSE_CATS, INCOME_CATS } from "@/lib/types";
import { todayISO } from "@/lib/format";

type Props = {
  open: boolean;
  initial: Transaction | null;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  onDelete?: (id: string) => void;
};

type State = {
  id: string;
  date: string;
  type: TxType;
  category: string;
  amount: string;
  note: string;
  recurring: boolean;
};

function blank(): State {
  return {
    id: "",
    date: todayISO(),
    type: "expense",
    category: "Food",
    amount: "",
    note: "",
    recurring: false,
  };
}

export default function TxModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [s, setS] = useState<State>(blank());

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setS({
        id: initial.id,
        date: initial.date,
        type: initial.type,
        category: initial.category,
        amount: initial.amount.toString(),
        note: initial.note,
        recurring: initial.recurring,
      });
    } else {
      setS(blank());
    }
  }, [open, initial]);

  if (!open) return null;

  const cats = s.type === "income" ? INCOME_CATS : EXPENSE_CATS;

  const submit = () => {
    const amount = parseFloat(s.amount);
    if (!isFinite(amount) || amount <= 0) return;
    const t: Transaction = {
      id: s.id || crypto.randomUUID(),
      date: s.date,
      type: s.type,
      category: s.category,
      amount: Math.round(amount),
      note: s.note.trim(),
      recurring: s.recurring,
    };
    onSave(t);
  };

  return (
    <Shell onClose={onClose}>
      <div className="flex items-center justify-between">
        <div className="small-caps">
          {initial ? "Edit entry" : "New entry"}
        </div>
        <button onClick={onClose} className="text-rule hover:text-accent tr-120">
          ×
        </button>
      </div>
      <h2 className="serif mt-2" style={{ fontSize: 26, letterSpacing: "-0.02em" }}>
        {initial ? "Amend a line" : "Record a line"}
      </h2>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Row label="Type">
          <div className="flex gap-4">
            {(["expense", "income"] as TxType[]).map((t) => (
              <label
                key={t}
                className={`inline-flex items-center gap-2 cursor-pointer font-mono text-[12px] uppercase tracking-[0.12em] ${
                  s.type === t ? "text-ink" : "text-rule"
                }`}
              >
                <input
                  type="radio"
                  checked={s.type === t}
                  onChange={() =>
                    setS((p) => ({
                      ...p,
                      type: t,
                      category: t === "income" ? "Income" : "Food",
                    }))
                  }
                />
                {t}
              </label>
            ))}
          </div>
        </Row>
        <Row label="Date">
          <input
            type="date"
            value={s.date}
            onChange={(e) => setS((p) => ({ ...p, date: e.target.value }))}
            className="num text-ink py-1"
            style={{ fontSize: 13 }}
          />
        </Row>
        <Row label="Category">
          <select
            value={s.category}
            onChange={(e) =>
              setS((p) => ({ ...p, category: e.target.value }))
            }
            className="font-mono text-[12px] text-ink py-1"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Amount ₹">
          <input
            type="number"
            value={s.amount}
            autoFocus
            onChange={(e) => setS((p) => ({ ...p, amount: e.target.value }))}
            className="num text-ink py-1 w-full"
            style={{ fontSize: 16 }}
            placeholder="0"
          />
        </Row>
        <Row label="Note">
          <input
            type="text"
            value={s.note}
            onChange={(e) => setS((p) => ({ ...p, note: e.target.value }))}
            className="serif text-ink py-1 w-full"
            style={{ fontSize: 15 }}
            placeholder="A quiet detail…"
          />
        </Row>
        <Row label="Recurring">
          <label className="inline-flex items-center gap-2 cursor-pointer font-mono text-[12px] text-ink">
            <input
              type="checkbox"
              checked={s.recurring}
              onChange={(e) =>
                setS((p) => ({ ...p, recurring: e.target.checked }))
              }
            />
            <span className="text-rule">∞ repeats monthly</span>
          </label>
        </Row>

        <div className="mt-8 flex items-center justify-between">
          {initial && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(initial.id)}
              className="small-caps text-rule hover:text-accent tr-120"
            >
              delete entry ×
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-paper-2 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ink text-paper hover:bg-accent tr-120 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              {initial ? "Save ↵" : "Record ↵"}
            </button>
          </div>
        </div>
      </form>
    </Shell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-4 items-baseline hairline-b"
      style={{
        gridTemplateColumns: "100px 1fr",
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <label className="small-caps">{label}</label>
      <div>{children}</div>
    </div>
  );
}

export function Shell({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 backdrop flex items-center justify-center p-6"
      onMouseDown={onClose}
    >
      <div
        className="bg-paper border border-[1.5px] border-ink p-8 w-full overflow-auto"
        style={{
          maxWidth: wide ? 560 : 480,
          maxHeight: "90vh",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
