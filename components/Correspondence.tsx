"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import Blink from "./ui/Blink";

type Props = {
  messages: ChatMessage[];
  onSend: (q: string) => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
};

const STARTERS = [
  "Where am I leaking this month?",
  "Am I on track for the laptop goal?",
  "What's changed vs. last month?",
  "Is my savings rate reasonable for a student?",
];

function renderWithMark(text: string) {
  const parts = text.split(/(<mark>.*?<\/mark>)/g);
  return parts.map((p, i) => {
    const m = p.match(/^<mark>(.*)<\/mark>$/);
    if (m) {
      return (
        <mark key={i} className="accent-mark">
          {m[1]}
        </mark>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function Correspondence({
  messages,
  onSend,
  onClear,
  loading,
  error,
  inputRef,
}: Props) {
  const [value, setValue] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const submit = (text?: string) => {
    const q = (text ?? value).trim();
    if (!q || loading) return;
    setValue("");
    onSend(q);
  };

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between">
        <div className="small-caps">11 — Correspondence</div>
        <button
          onClick={onClear}
          className="small-caps text-rule hover:text-accent tr-120"
        >
          clear
        </button>
      </div>

      <div
        ref={logRef}
        className="mt-6 rule-t hairline-b"
        style={{
          minHeight: 220,
          maxHeight: 420,
          overflowY: "auto",
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {messages.length === 0 && !loading ? (
          <div className="py-6">
            <div className="serif-italic text-mute" style={{ fontSize: 16 }}>
              A blank thread. Ask a question — the observer has your month in hand.
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="px-3 py-2 border border-[0.5px] border-ink text-ink tr-120 hover:bg-ink hover:text-paper font-mono text-[11px] uppercase tracking-[0.1em]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <Row key={i} msg={m} />
            ))}
            {loading ? (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "90px 1fr" }}
              >
                <div className="num text-rule" style={{ fontSize: 11 }}>
                  →
                </div>
                <div className="text-mute">
                  <Blink label="Drafting reply" />
                </div>
              </div>
            ) : null}
            {error ? (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "90px 1fr" }}
              >
                <div className="num text-accent" style={{ fontSize: 11 }}>
                  →
                </div>
                <div className="serif-italic text-accent" style={{ fontSize: 14 }}>
                  {error}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-4 flex items-center gap-3 hairline-b pb-2"
      >
        <span className="num text-rule" style={{ fontSize: 13 }}>
          ?
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Write to the observer…"
          className="flex-1 num text-ink placeholder:text-rule"
          style={{ fontSize: 13 }}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="small-caps text-ink hover:text-accent tr-120 disabled:opacity-30"
        >
          ↵ send
        </button>
      </form>
      <div className="mt-2 small-caps text-rule">
        Press <span className="text-ink">/</span> to focus · {messages.length}{" "}
        exchanged
      </div>
    </section>
  );
}

function Row({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "90px 1fr" }}
    >
      <div className="num text-rule" style={{ fontSize: 11 }}>
        {isUser ? "?" : "→"} {msg.time}
      </div>
      <div
        className={
          isUser
            ? "num text-ink"
            : "serif-italic text-ink"
        }
        style={{
          fontSize: isUser ? 13 : 15,
          lineHeight: isUser ? 1.55 : 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {renderWithMark(msg.content)}
      </div>
    </div>
  );
}
