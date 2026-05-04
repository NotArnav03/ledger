import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MODEL_PRIMARY = "claude-sonnet-4-5";
const MODEL_FALLBACK = "claude-sonnet-4-20250514";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not set on the server." },
        { status: 500 }
      );
    }
    const body = await req.json();
    const { history, question, context } = body ?? {};
    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Empty question." },
        { status: 400 }
      );
    }

    const system =
      "You are the observer behind a personal finance ledger for an Indian student. You have full access to their data (below). Reply in plain prose — no markdown, no bullets, no headers. Keep replies short (2-4 sentences usually; longer only if the question demands it). Use specific numbers from the data. Currency is INR (₹). Tone: dry, precise, slightly warm — like a thoughtful accountant writing a margin note. Never cheerlead. When highlighting a key figure, you may wrap it in <mark>₹X</mark> — the UI will underline it in accent colour. Use this sparingly, for the single most important number in your answer.\n\n" +
      "DATA: " +
      JSON.stringify(context ?? {});

    const msgs: Msg[] = [];
    if (Array.isArray(history)) {
      for (const m of history as Msg[]) {
        if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
          msgs.push({ role: m.role, content: m.content });
        }
      }
    }
    msgs.push({ role: "user", content: question });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const text = await callModel(client, system, msgs);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/correspond failed:", err);
    return NextResponse.json(
      { error: "Reply failed." },
      { status: 500 }
    );
  }
}

async function callModel(
  client: Anthropic,
  system: string,
  messages: Msg[]
): Promise<string> {
  for (const model of [MODEL_PRIMARY, MODEL_FALLBACK]) {
    try {
      const res = await client.messages.create({
        model,
        max_tokens: 1000,
        system,
        messages,
      });
      const text = res.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("")
        .trim();
      if (text) return text;
    } catch (err) {
      if (model === MODEL_FALLBACK) throw err;
    }
  }
  throw new Error("No text returned.");
}
