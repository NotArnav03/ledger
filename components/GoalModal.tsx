"use client";

import { useEffect, useState } from "react";
import type { Goal } from "@/lib/types";
import { Shell } from "./TxModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (g: Omit<Goal, "id" | "createdAt">) => void;
};

export default function GoalModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (open) {
      setName("");
      setTarget("");
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const t = parseFloat(target);
    if (!name.trim() || !isFinite(t) || t <= 0) return;
    onSave({
      name: name.trim(),
      target: Math.round(t),
      deadline,
    });
  };

  return (
    <Shell onClose={onClose}>
      <div className="flex items-center justify-between">
        <div className="small-caps">New goal</div>
        <button onClick={onClose} className="text-rule hover:text-accent tr-120">
          ×
        </button>
      </div>
      <h2
        className="serif mt-2"
        style={{ fontSize: 26, letterSpacing: "-0.02em" }}
      >
        Set a horizon
      </h2>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Row label="Name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="serif text-ink py-1 w-full"
            style={{ fontSize: 15 }}
            placeholder="Laptop, emergency buffer…"
          />
        </Row>
        <Row label="Target ₹">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="num text-ink py-1 w-full"
            style={{ fontSize: 16 }}
          />
        </Row>
        <Row label="Deadline">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="num text-ink py-1"
            style={{ fontSize: 13 }}
          />
        </Row>

        <div className="mt-8 flex items-center justify-end gap-3">
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
            Record ↵
          </button>
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
