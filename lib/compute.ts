import type { Budgets, Transaction } from "./types";
import { addMonths, monthKey, monthShort } from "./format";
import { newId } from "./api";

export type MonthTotals = {
  inflow: number;
  outflow: number;
  net: number;
  savingsRate: number;
  count: number;
};

export function totalsFor(
  txs: Transaction[],
  mk: string
): MonthTotals {
  let inflow = 0;
  let outflow = 0;
  let count = 0;
  for (const t of txs) {
    if (monthKey(t.date) !== mk) continue;
    count += 1;
    if (t.type === "income") inflow += t.amount;
    else outflow += t.amount;
  }
  const net = inflow - outflow;
  const savingsRate = inflow > 0 ? (net / inflow) * 100 : 0;
  return { inflow, outflow, net, savingsRate, count };
}

export function momDelta(a: number, b: number): number | null {
  if (b === 0) return null;
  return ((a - b) / b) * 100;
}

export type CategoryStat = {
  category: string;
  spent: number;
  budget: number;
  avg3: number;
  trend: number | null;
  prior: number;
};

export function expenseCategoryStats(
  txs: Transaction[],
  mk: string,
  budgets: Budgets
): CategoryStat[] {
  const cats = new Set<string>(Object.keys(budgets));
  txs.forEach((t) => {
    if (t.type === "expense") cats.add(t.category);
  });

  const prior = addMonths(mk, -1);
  const m1 = addMonths(mk, -1);
  const m2 = addMonths(mk, -2);
  const m3 = addMonths(mk, -3);

  const result: CategoryStat[] = [];
  cats.forEach((cat) => {
    let spent = 0;
    let priorSpent = 0;
    let s1 = 0;
    let s2 = 0;
    let s3 = 0;
    for (const t of txs) {
      if (t.type !== "expense" || t.category !== cat) continue;
      const k = monthKey(t.date);
      if (k === mk) spent += t.amount;
      if (k === prior) priorSpent += t.amount;
      if (k === m1) s1 += t.amount;
      if (k === m2) s2 += t.amount;
      if (k === m3) s3 += t.amount;
    }
    const avg3 = (s1 + s2 + s3) / 3;
    const trend =
      priorSpent > 0 ? ((spent - priorSpent) / priorSpent) * 100 : null;
    result.push({
      category: cat,
      spent,
      budget: budgets[cat] ?? 0,
      avg3,
      trend,
      prior: priorSpent,
    });
  });
  result.sort((a, b) => b.spent - a.spent);
  return result;
}

export type FlowPoint = {
  mk: string;
  label: string;
  inflow: number;
  outflow: number;
};

export function flowSeries(
  txs: Transaction[],
  mk: string,
  months = 6
): FlowPoint[] {
  const points: FlowPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const k = addMonths(mk, -i);
    const t = totalsFor(txs, k);
    points.push({
      mk: k,
      label: monthShort(k),
      inflow: t.inflow,
      outflow: t.outflow,
    });
  }
  return points;
}

export function topOutflows(txs: Transaction[], mk: string, n = 3): Transaction[] {
  return txs
    .filter((t) => t.type === "expense" && monthKey(t.date) === mk)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}

export function monthsWithData(txs: Transaction[]): string[] {
  const s = new Set<string>();
  txs.forEach((t) => s.add(monthKey(t.date)));
  return Array.from(s).sort();
}

export function recentMonthlyNet(txs: Transaction[], mk: string, months = 3): number {
  let sum = 0;
  for (let i = 0; i < months; i++) {
    const k = addMonths(mk, -i);
    const t = totalsFor(txs, k);
    sum += t.net;
  }
  return sum / months;
}

export function generateRecurring(
  txs: Transaction[],
  curMonthKey: string
): Transaction[] {
  const recurring = txs.filter((t) => t.recurring);
  if (recurring.length === 0) return [];

  // fingerprint → most-recent transaction for that series
  const latest = new Map<string, Transaction>();
  for (const t of recurring) {
    const key = `${t.type}|${t.category}|${t.amount}|${t.note}`;
    const prev = latest.get(key);
    if (!prev || t.date > prev.date) latest.set(key, t);
  }

  const generated: Transaction[] = [];
  for (const [key, tmpl] of latest) {
    // already exists in current month
    const alreadyHas = recurring.some(
      (t) =>
        `${t.type}|${t.category}|${t.amount}|${t.note}` === key &&
        t.date.startsWith(curMonthKey)
    );
    if (alreadyHas) continue;
    // only generate if the template is from a prior month
    if (tmpl.date.startsWith(curMonthKey)) continue;

    const [y, m] = curMonthKey.split("-");
    const date = `${y}-${m}-01`;
    generated.push({ ...tmpl, id: newId(), date });
  }
  return generated;
}

export function computeGoalSaved(
  goal: { createdAt: string },
  txs: { date: string; type: string; amount: number }[]
): number {
  const net = txs
    .filter((t) => t.date >= goal.createdAt)
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
  return Math.max(0, net);
}

export function goalEta(
  remaining: number,
  monthlyNet: number
): string {
  if (monthlyNet <= 0 || remaining <= 0) return "";
  const months = Math.ceil(remaining / monthlyNet);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const m = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][d.getMonth()];
  return "Est. " + m + " " + d.getFullYear();
}
