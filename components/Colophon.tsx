"use client";

import { useRef } from "react";

type Props = {
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onLoadExample: () => void;
};

export default function Colophon({
  onExport,
  onImport,
  onReset,
  onLoadExample,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <footer className="mt-20 pt-8 rule-t">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="small-caps mb-3">12 — Colophon</div>
          <p
            className="serif-italic text-mute"
            style={{ fontSize: 13, lineHeight: 1.6, maxWidth: "60ch" }}
          >
            Set in Source Serif 4 and Inter Tight, with IBM Plex Mono for the
            numbers. Composed in the spirit of Müller-Brockmann grids and Dieter
            Rams restraint. All figures are stored locally in this browser —
            nothing is uploaded. Export to a CSV to carry them elsewhere; import
            to bring them back. Resetting restores the seed data.
          </p>
          <p
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-rule"
          >
            Ledger · Private, local · v0.1
          </p>
        </div>
        <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
          <button
            onClick={onLoadExample}
            className="w-full md:w-auto inline-flex items-center justify-between gap-4 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            Load example <span>↳</span>
          </button>
          <button
            onClick={onExport}
            className="w-full md:w-auto inline-flex items-center justify-between gap-4 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            Export CSV <span>↓</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full md:w-auto inline-flex items-center justify-between gap-4 px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            Import CSV <span>↑</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={onReset}
            className="w-full md:w-auto inline-flex items-center justify-between gap-4 px-3 py-2 border border-[0.5px] border-accent text-accent tr-120 hover:bg-accent hover:text-paper font-mono text-[11px] uppercase tracking-[0.12em]"
          >
            Reset all <span>×</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
