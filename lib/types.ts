export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;
  type: TxType;
  category: string;
  amount: number;
  note: string;
  recurring: boolean;
};

export type Budgets = Record<string, number>;

export type Goal = {
  id: string;
  name: string;
  target: number;
  deadline: string;
  createdAt: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time: string;
};

export type Observations = Record<string, string>;

export const EXPENSE_CATS = [
  "Food",
  "Transport",
  "Books",
  "Subs",
  "Fun",
  "Savings",
] as const;

export const INCOME_CATS = [
  "Income",
  "Scholarship",
  "Gift",
  "Other",
] as const;

export const DEFAULT_BUDGETS: Budgets = {
  Food: 4000,
  Transport: 1500,
  Books: 2500,
  Subs: 600,
  Fun: 3000,
  Savings: 5000,
};
