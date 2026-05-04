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
    const { monthKey, category, transactions, budgets } = body ?? {};
    if (!monthKey || !category) {
      return NextResponse.json(
        { error: "Invalid payload." },
        { status: 400 }
      );
    }

    type Tx = { date: string; type: string; category: string; amount: number; note: string };
    const scoped = (Array.isArray(transactions) ? (transactions as Tx[]) : [])
      .filter((t) => t.type === "expense" && t.category === category)
      .filter((t) => {
        const k = t.date.slice(0, 7);
        const [y, m] = monthKey.split("-").map((s: string) => parseInt(s, 10));
        const dDate = new Date(y, m - 1 - 2, 1);
        const tDate = new Date(k + "-01");
        return tDate >= dDate;
      });

    const payload = {
      month: monthKey,
      category,
      budget: budgets?.[category] ?? 0,
      transactions: scoped,
    };

    const prompt =
      "You are analysing a single spending category for an Indian student (INR, ₹). Write two short paragraphs, plain prose. No markdown, no greetings, no headers.\n\n" +
      "Paragraph 1: What's actually going on in this category — the pattern, the rhythm, the typical transaction size. Reference specific notes if they're interesting.\n" +
      "Paragraph 2: One honest observation or question worth asking yourself about this category.\n\n" +
      "Under 100 words. Dry, specific, respectful.\n\n" +
      "Data: " +
      JSON.stringify(payload);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const text = await callModel(client, prompt);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/dive failed:", err);
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
