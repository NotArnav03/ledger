"use client";

import Blink from "./ui/Blink";
import { Shell } from "./TxModal";

type Props = {
  open: boolean;
  category: string | null;
  text: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRedraft: () => void;
};

export default function DiveModal({
  open,
  category,
  text,
  loading,
  error,
  onClose,
  onRedraft,
}: Props) {
  if (!open) return null;
  return (
    <Shell onClose={onClose} wide>
      <div className="flex items-center justify-between">
        <div className="small-caps">Category dive · {category}</div>
        <button
          onClick={onClose}
          className="text-rule hover:text-accent tr-120"
        >
          ×
        </button>
      </div>
      <h2
        className="serif mt-2"
        style={{ fontSize: 28, letterSpacing: "-0.02em" }}
      >
        {category}
      </h2>

      <div
        className="mt-6 serif-italic text-ink"
        style={{ fontSize: 16, lineHeight: 1.55, minHeight: 120 }}
      >
        {loading ? (
          <div className="text-mute">
            <Blink label="Analysing" />
          </div>
        ) : error ? (
          <span className="text-mute">{error}</span>
        ) : text ? (
          <div className="space-y-4">
            {text.split(/\n\s*\n/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onRedraft}
          disabled={loading}
          className="px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {text ? "Redraft ↳" : "Analyse ↳"}
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-paper-2 font-mono text-[11px] uppercase tracking-[0.12em]"
        >
          Close
        </button>
      </div>
    </Shell>
  );
}
