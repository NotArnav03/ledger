export function fmt(n: number): string {
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";
  const s = abs.toLocaleString("en-IN");
  return sign + "₹" + s;
}

export function fmtShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 100000) return sign + "₹" + (abs / 100000).toFixed(1) + "L";
  if (abs >= 1000) return sign + "₹" + (abs / 1000).toFixed(1) + "k";
  return sign + "₹" + Math.round(abs).toString();
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(): string {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    "-" +
    (d.getMonth() + 1).toString().padStart(2, "0")
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(mk: string): string {
  const [y, m] = mk.split("-");
  const idx = parseInt(m, 10) - 1;
  return MONTHS[idx] + " " + y;
}

export function monthLong(mk: string): string {
  const [, m] = mk.split("-");
  const idx = parseInt(m, 10) - 1;
  return MONTHS[idx];
}

export function monthShort(mk: string): string {
  return monthLong(mk).slice(0, 3);
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : TENS[t] + "-" + ONES[o];
}

export function spellYear(yearStr: string): string {
  const n = parseInt(yearStr, 10);
  if (isNaN(n)) return yearStr;
  const hi = Math.floor(n / 100);
  const lo = n % 100;
  const hiWord = twoDigits(hi);
  if (lo === 0) return hiWord + " Hundred";
  const loWord = lo < 10 ? "Oh-" + ONES[lo] : twoDigits(lo);
  return hiWord + " " + loWord;
}

export function time24(d: Date = new Date()): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return h + ":" + m;
}

export function todayISO(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    d.getDate().toString().padStart(2, "0")
  );
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return d + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m, 10) - 1];
}

export function addMonths(mk: string, delta: number): string {
  const [y, m] = mk.split("-").map((s) => parseInt(s, 10));
  const date = new Date(y, m - 1 + delta, 1);
  return (
    date.getFullYear().toString() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0")
  );
}
