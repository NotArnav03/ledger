import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MODEL_PRIMARY = "claude-sonnet-4-5";
const MODEL_FALLBACK = "claude-sonnet-4-20250514";

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
    const { monthKey, transactions, budgets, goals } = body ?? {};
    if (!monthKey || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Invalid payload." },
        { status: 400 }
      );
    }

    const monthTx = transactions.filter((t: { date: string }) =>
      t.date.startsWith(monthKey)
    );

    const payload = {
      month: monthKey,
      budgets,
      goals,
      transactions: monthTx,
    };

    const prompt =
      "You are a precise, no-nonsense financial observer writing a brief monthly note for an Indian student (currency INR, ₹). Write three short paragraphs, plain prose only — no markdown, no bullet points, no headers, no greeting.\n\n" +
      "Paragraph 1 — Headline: the single most important thing about this month. One specific number that matters.\n" +
      "Paragraph 2 — Concern: the category or transaction that warrants attention. Be specific; reference actual amounts. If nothing is concerning, note what's going unusually right instead.\n" +
      "Paragraph 3 — Suggestion: one concrete, actionable move for next month. Tied to their numbers, not generic.\n\n" +
      "Tone: observational, slightly dry, respectful of the reader's intelligence. Don't cheerlead. No \"great job\" or \"awesome\". Think: a careful accountant, not a coach.\n\n" +
      "Keep under 160 words total.\n\n" +
      "Data: " +
      JSON.stringify(payload);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const text = await callModel(client, prompt);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/observe failed:", err);
    return NextResponse.json(
      { error: "Analysis failed." },
      { status: 500 }
    );
  }
}

async function callModel(client: Anthropic, prompt: string): Promise<string> {
  for (const model of [MODEL_PRIMARY, MODEL_FALLBACK]) {
    try {
      const res = await client.messages.create({
        model,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
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
