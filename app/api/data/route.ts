import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Payload = {
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    category: string;
    amount: number;
    note: string;
    recurring: boolean;
  }>;
  budgets: Record<string, number>;
  goals: Array<{
    id: string;
    name: string;
    target: number;
    deadline: string;
    createdAt: string;
  }>;
  chat: Array<{ role: string; content: string; time: string }>;
  observations: Record<string, string>;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [transactions, budgets, goals, chats, observations] = await Promise.all([
    prisma.transaction.findMany({ where: { userId } }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.chatMessage.findMany({ where: { userId }, orderBy: { ord: "asc" } }),
    prisma.observation.findMany({ where: { userId } }),
  ]);

  const budgetMap: Record<string, number> = {};
  for (const b of budgets) budgetMap[b.category] = b.amount;

  const obsMap: Record<string, string> = {};
  for (const o of observations) obsMap[o.monthKey] = o.text;

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      note: t.note,
      recurring: t.recurring,
    })),
    budgets: budgetMap,
    goals: goals.map((g) => ({
      id: g.id,
      name: g.name,
      target: g.target,
      deadline: g.deadline,
      createdAt: g.createdAt,
    })),
    chat: chats.map((c) => ({ role: c.role, content: c.content, time: c.time })),
    observations: obsMap,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.chatMessage.deleteMany({ where: { userId } }),
    prisma.observation.deleteMany({ where: { userId } }),
    prisma.transaction.createMany({
      data: body.transactions.map((t) => ({
        id: t.id,
        userId,
        date: t.date,
        type: t.type,
        category: t.category,
        amount: t.amount,
        note: t.note ?? "",
        recurring: !!t.recurring,
      })),
    }),
    prisma.budget.createMany({
      data: Object.entries(body.budgets).map(([category, amount]) => ({
        userId,
        category,
        amount,
      })),
    }),
    prisma.goal.createMany({
      data: body.goals.map((g) => ({
        id: g.id,
        userId,
        name: g.name,
        target: g.target,
        deadline: g.deadline,
        createdAt: g.createdAt,
      })),
    }),
    prisma.chatMessage.createMany({
      data: body.chat.map((c, i) => ({
        userId,
        role: c.role,
        content: c.content,
        time: c.time,
        ord: i,
      })),
    }),
    prisma.observation.createMany({
      data: Object.entries(body.observations).map(([monthKey, text]) => ({
        userId,
        monthKey,
        text,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
