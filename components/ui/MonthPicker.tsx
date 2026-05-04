"use client";

import { monthName } from "@/lib/format";

type Props = {
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

export default function MonthPicker({ value, options, onChange }: Props) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="small-caps">Month</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-[12px] text-ink hairline-b px-1 py-1 tr-120 hover:text-accent"
      >
        {options.map((mk) => (
          <option key={mk} value={mk}>
            {monthName(mk)}
          </option>
        ))}
      </select>
    </label>
  );
}
