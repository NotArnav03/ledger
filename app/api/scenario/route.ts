import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  let body: {
    avgInflow: number;
    baseNet: number;
    newNet: number;
    adjustments: Record<string, number>;
    avgByCategory: Record<string, number>;
    newByCategory: Record<string, number>;
    goals: Array<{ name: string; target: number; baseEta: string; newEta: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const changedCats = Object.entries(body.adjustments)
    .filter(([, v]) => v !== 0)
    .map(([cat, pct]) => `${cat}: ${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`)
    .join(", ");

  const prompt = `You are a concise financial advisor for an Indian student (currency INR, ₹). Analyse this "what if" spending scenario.

Current avg monthly inflow: ₹${Math.round(body.avgInflow)}
Current avg monthly net: ₹${Math.round(body.baseNet)}
Adjusted monthly net: ₹${Math.round(body.newNet)} (${body.newNet >= body.baseNet ? "+" : ""}${Math.round(body.newNet - body.baseNet)})

Adjustments made: ${changedCats || "none"}

Category breakdown (current avg → adjusted):
${Object.entries(body.avgByCategory)
  .map(([cat, avg]) => `  ${cat}: ₹${Math.round(avg)} → ₹${Math.round(body.newByCategory[cat] ?? avg)}`)
  .join("\n")}

Goal impact:
${body.goals.map((g) => `  ${g.name} (₹${g.target}): ${g.baseEta} → ${g.newEta}`).join("\n")}

Write 2–3 short paragraphs of plain prose (no markdown, no bullets, no headers). Cover:
1. Whether this scenario is realistic and sustainable
2. The most meaningful trade-off or risk
3. One specific actionable suggestion

Tone: dry, precise, honest — like a thoughtful accountant writing a margin note. Under 130 words.`;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/scenario failed:", err);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
