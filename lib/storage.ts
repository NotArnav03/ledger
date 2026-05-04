import type {
  Budgets,
  ChatMessage,
  Goal,
  Observations,
  Transaction,
} from "./types";
import { DEFAULT_BUDGETS } from "./types";

const NS = "ledger:";
const KEY_TX = NS + "transactions";
const KEY_BUDGETS = NS + "budgets";
const KEY_GOALS = NS + "goals";
const KEY_CHAT = NS + "chat";
const KEY_OBS = NS + "observations";
const KEY_SEEDED = NS + "seeded";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or access — ignore silently
  }
}

export const storage = {
  getTransactions: (): Transaction[] => read<Transaction[]>(KEY_TX, []),
  setTransactions: (v: Transaction[]) => write(KEY_TX, v),

  getBudgets: (): Budgets => read<Budgets>(KEY_BUDGETS, DEFAULT_BUDGETS),
  setBudgets: (v: Budgets) => write(KEY_BUDGETS, v),

  getGoals: (): Goal[] => read<Goal[]>(KEY_GOALS, []),
  setGoals: (v: Goal[]) => write(KEY_GOALS, v),

  getChat: (): ChatMessage[] => read<ChatMessage[]>(KEY_CHAT, []),
  setChat: (v: ChatMessage[]) => write(KEY_CHAT, v),

  getObservations: (): Observations => read<Observations>(KEY_OBS, {}),
  setObservations: (v: Observations) => write(KEY_OBS, v),

  isSeeded: (): boolean => read<boolean>(KEY_SEEDED, false),
  markSeeded: () => write(KEY_SEEDED, true),

  clearAll: () => {
    if (typeof window === "undefined") return;
    [KEY_TX, KEY_BUDGETS, KEY_GOALS, KEY_CHAT, KEY_OBS, KEY_SEEDED].forEach(
      (k) => window.localStorage.removeItem(k)
    );
  },
};

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
