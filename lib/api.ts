import type {
  Budgets,
  ChatMessage,
  Goal,
  Observations,
  Transaction,
} from "./types";

export type LedgerData = {
  transactions: Transaction[];
  budgets: Budgets;
  goals: Goal[];
  chat: ChatMessage[];
  observations: Observations;
};

export async function loadAll(): Promise<LedgerData> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load data");
  const j = await res.json();
  return {
    transactions: j.transactions ?? [],
    budgets: j.budgets ?? {},
    goals: j.goals ?? [],
    chat: (j.chat ?? []).map((c: { role: string; content: string; time: string }) => ({
      role: c.role as ChatMessage["role"],
      content: c.content,
      time: c.time,
    })),
    observations: j.observations ?? {},
  };
}

export async function saveAll(data: LedgerData): Promise<void> {
  const res = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not save data");
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
