import type { Goal, Transaction } from "./types";
import { newId } from "./storage";
import { addMonths, currentMonthKey } from "./format";

function iso(mk: string, day: number): string {
  return mk + "-" + day.toString().padStart(2, "0");
}

function makeTx(
  date: string,
  type: Transaction["type"],
  category: string,
  amount: number,
  note: string,
  recurring = false
): Transaction {
  return {
    id: newId(),
    date,
    type,
    category,
    amount,
    note,
    recurring,
  };
}

export function seedTransactions(): Transaction[] {
  const now = currentMonthKey();
  const m1 = addMonths(now, -1);
  const m2 = addMonths(now, -2);
  const m3 = addMonths(now, -3);
  const m4 = addMonths(now, -4);
  const m5 = addMonths(now, -5);

  const rows: Transaction[] = [];

  // Current month
  rows.push(makeTx(iso(now, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(now, 2), "income", "Income", 5000, "Tutoring — Sharma family", true));
  rows.push(makeTx(iso(now, 3), "expense", "Food", 420, "Mess top-up"));
  rows.push(makeTx(iso(now, 4), "expense", "Transport", 180, "Metro recharge"));
  rows.push(makeTx(iso(now, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(now, 6), "expense", "Books", 1200, "Griffiths — secondhand"));
  rows.push(makeTx(iso(now, 8), "expense", "Food", 340, "Dinner with Ria"));
  rows.push(makeTx(iso(now, 10), "expense", "Fun", 800, "Cinema + late rickshaw"));
  rows.push(makeTx(iso(now, 12), "expense", "Food", 260, "Canteen"));
  rows.push(makeTx(iso(now, 14), "expense", "Transport", 95, "Auto — dept"));
  rows.push(makeTx(iso(now, 15), "expense", "Savings", 3000, "SIP — index", true));
  rows.push(makeTx(iso(now, 17), "expense", "Fun", 450, "Bookshop wander"));
  rows.push(makeTx(iso(now, 19), "expense", "Food", 520, "Pav bhaji, friends"));
  rows.push(makeTx(iso(now, 21), "income", "Gift", 2000, "Grandmother — pocket"));
  rows.push(makeTx(iso(now, 22), "expense", "Food", 380, "Mess overshoot"));

  // m1
  rows.push(makeTx(iso(m1, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(m1, 2), "income", "Income", 5000, "Tutoring", true));
  rows.push(makeTx(iso(m1, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(m1, 6), "expense", "Food", 3800, "Mess + eating out aggregate"));
  rows.push(makeTx(iso(m1, 10), "expense", "Transport", 1200, "Metro + autos"));
  rows.push(makeTx(iso(m1, 12), "expense", "Books", 2100, "Griffiths + Strang"));
  rows.push(makeTx(iso(m1, 15), "expense", "Savings", 3000, "SIP", true));
  rows.push(makeTx(iso(m1, 18), "expense", "Fun", 2600, "Weekend Goa trip share"));
  rows.push(makeTx(iso(m1, 25), "expense", "Food", 450, "Cafe, studying"));

  // m2
  rows.push(makeTx(iso(m2, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(m2, 2), "income", "Income", 4500, "Tutoring"));
  rows.push(makeTx(iso(m2, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(m2, 7), "expense", "Food", 3200, "Mess + tea stalls"));
  rows.push(makeTx(iso(m2, 10), "expense", "Transport", 950, "Metro"));
  rows.push(makeTx(iso(m2, 12), "expense", "Books", 1800, "Lab manual"));
  rows.push(makeTx(iso(m2, 15), "expense", "Savings", 3000, "SIP", true));
  rows.push(makeTx(iso(m2, 20), "expense", "Fun", 1400, "Concert with Ria"));

  // m3
  rows.push(makeTx(iso(m3, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(m3, 2), "income", "Income", 5000, "Tutoring", true));
  rows.push(makeTx(iso(m3, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(m3, 8), "expense", "Food", 3600, "Mess"));
  rows.push(makeTx(iso(m3, 11), "expense", "Transport", 1100, "Metro + rickshaw"));
  rows.push(makeTx(iso(m3, 14), "expense", "Books", 1500, "Used copies"));
  rows.push(makeTx(iso(m3, 15), "expense", "Savings", 3000, "SIP", true));
  rows.push(makeTx(iso(m3, 22), "expense", "Fun", 1800, "Birthday dinner — Dev"));

  // m4
  rows.push(makeTx(iso(m4, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(m4, 2), "income", "Income", 5000, "Tutoring", true));
  rows.push(makeTx(iso(m4, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(m4, 9), "expense", "Food", 4100, "Mess + canteen"));
  rows.push(makeTx(iso(m4, 12), "expense", "Transport", 1300, "Metro + auto"));
  rows.push(makeTx(iso(m4, 14), "expense", "Books", 2400, "Semester books"));
  rows.push(makeTx(iso(m4, 15), "expense", "Savings", 2500, "SIP"));
  rows.push(makeTx(iso(m4, 26), "expense", "Fun", 2200, "Weekend trip"));

  // m5
  rows.push(makeTx(iso(m5, 1), "income", "Scholarship", 15000, "Monthly stipend", true));
  rows.push(makeTx(iso(m5, 2), "income", "Income", 4500, "Tutoring"));
  rows.push(makeTx(iso(m5, 5), "expense", "Subs", 599, "Spotify", true));
  rows.push(makeTx(iso(m5, 10), "expense", "Food", 3400, "Mess"));
  rows.push(makeTx(iso(m5, 13), "expense", "Transport", 980, "Metro"));
  rows.push(makeTx(iso(m5, 15), "expense", "Savings", 2500, "SIP"));
  rows.push(makeTx(iso(m5, 19), "expense", "Fun", 900, "Cinema"));
  rows.push(makeTx(iso(m5, 24), "expense", "Books", 1200, "Reference"));

  return rows;
}

export function seedGoals(): Goal[] {
  const d = new Date();
  d.setMonth(d.getMonth() + 8);
  const deadline = d.toISOString().slice(0, 10);
  return [
    {
      id: newId(),
      name: "Laptop — replacement",
      target: 65000,
      deadline,
      createdAt: new Date().toISOString().slice(0, 10),
    },
    {
      id: newId(),
      name: "Emergency buffer",
      target: 30000,
      deadline: (() => {
        const e = new Date();
        e.setMonth(e.getMonth() + 12);
        return e.toISOString().slice(0, 10);
      })(),
      createdAt: (() => {
        const s = new Date();
        s.setMonth(s.getMonth() - 2);
        return s.toISOString().slice(0, 10);
      })(),
    },
  ];
}
