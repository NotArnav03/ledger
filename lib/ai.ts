import type { Budgets, ChatMessage, Goal, Transaction } from "./types";

export type ObservePayload = {
  monthKey: string;
  transactions: Transaction[];
  budgets: Budgets;
  goals: Goal[];
};

export type CorrespondPayload = {
  history: ChatMessage[];
  question: string;
  context: {
    monthKey: string;
    transactions: Transaction[];
    budgets: Budgets;
    goals: Goal[];
  };
};

export type DivePayload = {
  monthKey: string;
  category: string;
  transactions: Transaction[];
  budgets: Budgets;
};

async function post<T>(url: string, body: T): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok || !data.text) {
    throw new Error(data.error || "Request failed.");
  }
  return data.text;
}

export function aiObserve(p: ObservePayload): Promise<string> {
  return post("/api/observe", p);
}

export function aiCorrespond(p: CorrespondPayload): Promise<string> {
  return post("/api/correspond", p);
}

export function aiDive(p: DivePayload): Promise<string> {
  return post("/api/dive", p);
}
