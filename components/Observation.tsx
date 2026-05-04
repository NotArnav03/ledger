"use client";

import { useState } from "react";
import Blink from "./ui/Blink";

type Props = {
  text: string | null;
  loading: boolean;
  onAnalyse: () => void;
  error: string | null;
  context: string;
  onContextChange: (v: string) => void;
};

export default function Observation({
  text,
  loading,
  onAnalyse,
  error,
  context,
  onContextChange,
}: Props) {
  const [expanded] = useState(true);
  const hasText = !!text;

  return (
    <section className="pr-0 md:pr-10">
      <div className="flex items-center justify-between">
        <div className="small-caps">05 — Observation</div>
        <button
          onClick={onAnalyse}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em] disabled:opacity-40"
        >
          {hasText ? "Redraft" : "Analyse"}
          <span className="text-[10px] opacity-60">↳</span>
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-3 hairline-b pb-4">
        <label className="small-caps shrink-0">This month</label>
        <input
          type="text"
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="Exams, trip home, stressful week… (optional context for AI)"
          className="serif text-ink py-1 flex-1 text-mute"
          style={{ fontSize: 13 }}
          maxLength={120}
        />
      </div>

      <div className="mt-6 serif-italic text-ink" style={{ fontSize: 17, lineHeight: 1.55 }}>
        {loading ? (
          <div className="text-mute">
            <Blink label="Drafting" />
          </div>
        ) : error ? (
          <div className="text-mute">
            <span className="small-caps mr-2">Error</span>
            <span>{error}</span>
          </div>
        ) : hasText && expanded ? (
          <div className="space-y-4">
            {text!
              .split(/\n\s*\n/)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        ) : (
          <div className="text-mute">
            <span>Awaiting first draft. Press </span>
            <span className="font-mono not-italic text-ink text-[13px]">
              Analyse
            </span>
            <span> to have the month observed.</span>
          </div>
        )}
      </div>
    </section>
  );
}
