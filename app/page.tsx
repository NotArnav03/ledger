"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import KpiRow from "@/components/KpiRow";
import Observation from "@/components/Observation";
import TopOutflows from "@/components/TopOutflows";
import FlowChart from "@/components/FlowChart";
import CategoryTrendsChart from "@/components/CategoryTrendsChart";
import Envelopes from "@/components/Envelopes";
import Goals from "@/components/Goals";
import Ledger from "@/components/Ledger";
import Correspondence from "@/components/Correspondence";
import Colophon from "@/components/Colophon";
import TxModal from "@/components/TxModal";
import GoalModal from "@/components/GoalModal";
import DiveModal from "@/components/DiveModal";
import RecurringBanner from "@/components/RecurringBanner";
import ScenarioPlanner from "@/components/ScenarioPlanner";
import CashFlowForecast from "@/components/CashFlowForecast";
import SubscriptionRadar from "@/components/SubscriptionRadar";

import { loadAll, saveAll, newId } from "@/lib/api";
import { seedGoals, seedTransactions } from "@/lib/seed";
import {
  DEFAULT_BUDGETS,
  type Budgets,
  type ChatMessage,
  type Goal,
  type Observations,
  type Transaction,
} from "@/lib/types";
import {
  addMonths,
  currentMonthKey,
  time24,
} from "@/lib/format";
import {
  cashFlowForecast,
  categoryTrendSeries,
  expenseCategoryStats,
  flowSeries,
  generateRecurring,
  monthsWithData,
  recentMonthlyNet,
  scenarioBase,
  subscriptionRadar,
  topOutflows,
  totalsFor,
} from "@/lib/compute";
import { aiCorrespond, aiDive, aiObserve } from "@/lib/ai";

export default function Page() {
  const [hydrated, setHydrated] = useState(false);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budgets>(DEFAULT_BUDGETS);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [observations, setObservations] = useState<Observations>({});

  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const [observeLoading, setObserveLoading] = useState(false);
  const [observeError, setObserveError] = useState<string | null>(null);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [recurringAdded, setRecurringAdded] = useState<import("@/lib/types").Transaction[]>([]);

  const [diveOpen, setDiveOpen] = useState(false);
  const [diveCategory, setDiveCategory] = useState<string | null>(null);
  const [diveText, setDiveText] = useState<string | null>(null);
  const [diveLoading, setDiveLoading] = useState(false);
  const [diveError, setDiveError] = useState<string | null>(null);

  const chatInputRef = useRef<HTMLInputElement>(null);

  // Initial hydrate from server. If no budgets stored yet, fall back to defaults.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadAll();
        if (cancelled) return;
        const cur = currentMonthKey();
        const generated = generateRecurring(data.transactions, cur);
        const allTxs = generated.length > 0
          ? [...generated, ...data.transactions]
          : data.transactions;
        setTxs(allTxs);
        if (generated.length > 0) setRecurringAdded(generated);
        setBudgets(
          Object.keys(data.budgets).length > 0 ? data.budgets : DEFAULT_BUDGETS
        );
        setGoals(data.goals);
        setChat(data.chat);
        setObservations(data.observations);
      } catch {
        // leave defaults
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced persist — pushes the whole snapshot when anything changes.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      void saveAll({
        transactions: txs,
        budgets,
        goals,
        chat,
        observations,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [hydrated, txs, budgets, goals, chat, observations]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "Escape") {
        setTxModalOpen(false);
        setGoalModalOpen(false);
        setDiveOpen(false);
        return;
      }
      if (isTyping) return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        openNewTx();
      } else if (e.key === "/") {
        e.preventDefault();
        chatInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Derived
  const monthOptions = useMemo(() => {
    const ms = monthsWithData(txs);
    const cur = currentMonthKey();
    if (!ms.includes(cur)) ms.push(cur);
    if (!ms.includes(monthKey)) ms.push(monthKey);
    return Array.from(new Set(ms)).sort().reverse();
  }, [txs, monthKey]);

  const current = useMemo(() => totalsFor(txs, monthKey), [txs, monthKey]);
  const priorKey = useMemo(() => addMonths(monthKey, -1), [monthKey]);
  const prior = useMemo(() => totalsFor(txs, priorKey), [txs, priorKey]);
  const catStats = useMemo(
    () => expenseCategoryStats(txs, monthKey, budgets),
    [txs, monthKey, budgets]
  );
  const flow = useMemo(() => flowSeries(txs, monthKey, 6), [txs, monthKey]);
  const catTrend = useMemo(() => categoryTrendSeries(txs, monthKey, 6), [txs, monthKey]);
  const scenBase = useMemo(() => scenarioBase(txs, monthKey, 3), [txs, monthKey]);
  const forecast = useMemo(() => cashFlowForecast(txs, monthKey), [txs, monthKey]);
  const subs = useMemo(() => subscriptionRadar(txs, monthKey), [txs, monthKey]);
  const top3 = useMemo(() => topOutflows(txs, monthKey, 3), [txs, monthKey]);
  const monthTxCount = useMemo(
    () => txs.filter((t) => t.date.slice(0, 7) === monthKey).length,
    [txs, monthKey]
  );

  // Handlers
  function openNewTx() {
    setEditingTx(null);
    setTxModalOpen(true);
  }
  function openEditTx(t: Transaction) {
    setEditingTx(t);
    setTxModalOpen(true);
  }
  function saveTx(t: Transaction) {
    setTxs((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx === -1) return [t, ...prev];
      const next = prev.slice();
      next[idx] = t;
      return next;
    });
    setTxModalOpen(false);
    setEditingTx(null);
  }
  function deleteTx(id: string) {
    setTxs((prev) => prev.filter((t) => t.id !== id));
    setTxModalOpen(false);
    setEditingTx(null);
  }

  function setBudget(cat: string, value: number) {
    setBudgets((prev) => ({ ...prev, [cat]: Math.max(0, value) }));
  }

  function addGoal(g: Omit<Goal, "id" | "createdAt">) {
    const full: Goal = {
      ...g,
      id: newId(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setGoals((prev) => [full, ...prev]);
    setGoalModalOpen(false);
  }
  function deleteGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  const monthlyNet = useMemo(
    () => recentMonthlyNet(txs, monthKey, 3),
    [txs, monthKey]
  );

  // Observation
  const handleAnalyse = useCallback(async () => {
    setObserveError(null);
    setObserveLoading(true);
    try {
      const text = await aiObserve({
        monthKey,
        transactions: txs,
        budgets,
        goals,
      });
      setObservations((prev) => ({ ...prev, [monthKey]: text }));
    } catch (err) {
      setObserveError(
        err instanceof Error
          ? err.message
          : "Could not draft this month's note."
      );
    } finally {
      setObserveLoading(false);
    }
  }, [monthKey, txs, budgets, goals]);

  // Correspondence
  const handleSend = useCallback(
    async (q: string) => {
      setChatError(null);
      const userMsg: ChatMessage = {
        role: "user",
        content: q,
        time: time24(),
      };
      const next = [...chat, userMsg];
      setChat(next);
      setChatLoading(true);
      try {
        const text = await aiCorrespond({
          history: next.map((m) => ({ role: m.role, content: m.content, time: m.time })),
          question: q,
          context: {
            monthKey,
            transactions: txs,
            budgets,
            goals,
          },
        });
        const reply: ChatMessage = {
          role: "assistant",
          content: text,
          time: time24(),
        };
        setChat((prev) => [...prev, reply]);
      } catch (err) {
        setChatError(
          err instanceof Error ? err.message : "The observer did not reply."
        );
      } finally {
        setChatLoading(false);
      }
    },
    [chat, monthKey, txs, budgets, goals]
  );

  function clearChat() {
    setChat([]);
    setChatError(null);
  }

  // Dive
  const handleDive = useCallback(
    async (cat: string) => {
      setDiveCategory(cat);
      setDiveOpen(true);
      setDiveText(null);
      setDiveError(null);
      setDiveLoading(true);
      try {
        const text = await aiDive({
          monthKey,
          category: cat,
          transactions: txs,
          budgets,
        });
        setDiveText(text);
      } catch (err) {
        setDiveError(
          err instanceof Error ? err.message : "Could not analyse."
        );
      } finally {
        setDiveLoading(false);
      }
    },
    [monthKey, txs, budgets]
  );

  const handleRedive = useCallback(() => {
    if (diveCategory) void handleDive(diveCategory);
  }, [diveCategory, handleDive]);

  // Export / import / reset
  function exportCsv() {
    const rows = [
      ["date", "type", "category", "amount", "note", "recurring"],
      ...txs.map((t) => [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        (t.note ?? "").replace(/"/g, '""'),
        t.recurring ? "true" : "false",
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((c) => (c.includes(",") || c.includes('"') || c.includes("\n") ? `"${c}"` : c))
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    const stamp =
      d.getFullYear() +
      "-" +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      d.getDate().toString().padStart(2, "0");
    a.download = "ledger-" + stamp + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCsv(text: string): Transaction[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const header = lines[0].toLowerCase();
    const hasHeader =
      header.includes("date") && header.includes("amount");
    const rows = hasHeader ? lines.slice(1) : lines;
    const out: Transaction[] = [];
    for (const line of rows) {
      const parts = splitCsvLine(line);
      if (parts.length < 4) continue;
      const [date, type, category, amountStr, note = "", rec = "false"] = parts;
      const amount = parseFloat(amountStr);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (type !== "income" && type !== "expense") continue;
      if (!isFinite(amount) || amount <= 0) continue;
      out.push({
        id: newId(),
        date,
        type,
        category: category || (type === "income" ? "Other" : "Food"),
        amount: Math.round(amount),
        note: note.replace(/^"|"$/g, "").replace(/""/g, '"'),
        recurring: rec === "true" || rec === "1",
      });
    }
    return out;
  }

  function splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else if (ch === '"') {
          inQ = false;
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') inQ = true;
        else if (ch === ",") {
          out.push(cur);
          cur = "";
        } else cur += ch;
      }
    }
    out.push(cur);
    return out;
  }

  function importCsv(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        alert("No valid rows found in that CSV.");
        return;
      }
      setTxs((prev) => [...parsed, ...prev]);
      alert(`Imported ${parsed.length} entries.`);
    };
    reader.readAsText(file);
  }

  function resetAll() {
    const ok = window.confirm(
      "This will erase all entries, goals, observations, and correspondence, and restore default budgets. Proceed?"
    );
    if (!ok) return;
    setTxs([]);
    setBudgets(DEFAULT_BUDGETS);
    setGoals([]);
    setChat([]);
    setObservations({});
    setMonthKey(currentMonthKey());
  }

  function loadExample() {
    if (txs.length > 0 || goals.length > 0) {
      const ok = window.confirm(
        "This will replace your current entries and goals with example data. Proceed?"
      );
      if (!ok) return;
    }
    const seededTx = seedTransactions();
    const seededGoals = seedGoals();
    setTxs(seededTx);
    setBudgets(DEFAULT_BUDGETS);
    setGoals(seededGoals);
    setChat([]);
    setObservations({});
    setMonthKey(currentMonthKey());
  }

  if (!hydrated) {
    return (
      <main
        className="mx-auto"
        style={{ maxWidth: 1200, padding: "40px 40px" }}
      >
        <div className="small-caps">Ledger — loading</div>
      </main>
    );
  }

  const observationText = observations[monthKey] ?? null;

  return (
    <main
      className="mx-auto"
      style={{
        maxWidth: 1200,
        padding: "40px 40px 80px",
      }}
    >
      <RecurringBanner
        added={recurringAdded}
        monthKey={monthKey}
        onDismiss={() => setRecurringAdded([])}
      />

      <Header
        monthKey={monthKey}
        monthOptions={monthOptions}
        onMonthChange={setMonthKey}
        entryCount={monthTxCount}
        onAdd={openNewTx}
      />

      <KpiRow current={current} prior={prior} priorKey={priorKey} />

      <CashFlowForecast forecast={forecast} monthKey={monthKey} />

      <section className="mt-14 grid gap-0 md:grid-cols-12">
        <div className="md:col-span-7 md:hairline-r md:pr-10">
          <Observation
            text={observationText}
            loading={observeLoading}
            error={observeError}
            onAnalyse={handleAnalyse}
          />
        </div>
        <div className="md:col-span-5 md:pl-10 mt-10 md:mt-0">
          <TopOutflows items={top3} />
        </div>
      </section>

      <FlowChart data={flow} />

      <CategoryTrendsChart points={catTrend.points} categories={catTrend.categories} />

      <Envelopes
        stats={catStats}
        onEditBudget={setBudget}
        onDive={handleDive}
      />

      <Goals
        goals={goals}
        txs={txs}
        monthlyNet={monthlyNet}
        onAdd={() => setGoalModalOpen(true)}
        onDelete={deleteGoal}
      />

      <ScenarioPlanner base={scenBase} goals={goals} txs={txs} />

      <SubscriptionRadar subscriptions={subs} />

      <Ledger
        transactions={txs}
        monthKey={monthKey}
        onEdit={openEditTx}
        onDelete={deleteTx}
        onAdd={openNewTx}
        onLoadExample={loadExample}
        totalEntries={txs.length}
      />

      <Correspondence
        messages={chat}
        onSend={handleSend}
        onClear={clearChat}
        loading={chatLoading}
        error={chatError}
        inputRef={chatInputRef}
      />

      <Colophon
        onExport={exportCsv}
        onImport={importCsv}
        onReset={resetAll}
        onLoadExample={loadExample}
      />

      <TxModal
        open={txModalOpen}
        initial={editingTx}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={saveTx}
        onDelete={deleteTx}
      />

      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={addGoal}
      />

      <DiveModal
        open={diveOpen}
        category={diveCategory}
        text={diveText}
        loading={diveLoading}
        error={diveError}
        onClose={() => setDiveOpen(false)}
        onRedraft={handleRedive}
      />
    </main>
  );
}
