/** Pure HR maths (no I/O) so it can be unit-tested. All money is whole UGX. */

export type Band = { from: number; rate: number };

/** Parses "from,rate" lines, e.g. "0,0\n335000,10\n410000,20". `from` = monthly income where the rate starts. */
export function parseBands(text: string): Band[] {
  const bands = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const [a, b] = l.split(",").map((x) => Number(x.trim()));
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0 || b > 100) throw new Error(`Line ${i + 1}: use "income from,rate %" (for example 335000,10)`);
    return { from: a, rate: b };
  });
  if (!bands.length || bands[0].from !== 0) throw new Error("The first band must start at 0");
  for (let i = 1; i < bands.length; i++) if (bands[i].from <= bands[i - 1].from) throw new Error("Bands must be in increasing order of income");
  return bands;
}

/** Progressive tax: each band's rate applies only to the slice of income inside that band. */
export function payeFor(taxable: number, bands: Band[]): number {
  let tax = 0;
  for (let i = 0; i < bands.length; i++) {
    const lo = bands[i].from, hi = bands[i + 1]?.from ?? Infinity;
    if (taxable > lo) tax += ((Math.min(taxable, hi) - lo) * bands[i].rate) / 100;
  }
  return Math.round(tax);
}

export type PayrollConfig = { bands: Band[]; nssfEmployeeBps: number; nssfEmployerBps: number; nssfCap: number; workingDaysPerMonth?: number };
export type LineInput = { basic: number; allowances: number; otherDeductions: number; unpaidDays: number };
export type LineResult = { unpaidDeduction: number; gross: number; nssfEmployee: number; nssfEmployer: number; paye: number; netPay: number };

/** PAYE is charged on gross pay; employee NSSF is deducted separately (it is not tax-deductible); employer NSSF is an employer cost. */
export function computeLine(i: LineInput, c: PayrollConfig): LineResult {
  const perDay = i.basic / (c.workingDaysPerMonth ?? 22);
  const unpaidDeduction = Math.min(i.basic, Math.round(perDay * i.unpaidDays));
  const gross = i.basic + i.allowances - unpaidDeduction;
  const base = c.nssfCap > 0 ? Math.min(gross, c.nssfCap) : gross;
  const nssfEmployee = Math.round((base * c.nssfEmployeeBps) / 10000);
  const nssfEmployer = Math.round((base * c.nssfEmployerBps) / 10000);
  const paye = payeFor(gross, c.bands);
  const netPay = Math.max(0, gross - nssfEmployee - paye - i.otherDeductions);
  return { unpaidDeduction, gross, nssfEmployee, nssfEmployer, paye, netPay };
}

const toUtc = (ymd: string) => { const [y, m, d] = ymd.split("-").map(Number); return Date.UTC(y, m - 1, d); };
const DAY = 86_400_000;

/** Working days (Mon–Fri) between two YYYY-MM-DD dates, inclusive. */
export function workingDays(start: string, end: string): number {
  let n = 0;
  for (let t = toUtc(start); t <= toUtc(end); t += DAY) { const dow = new Date(t).getUTCDay(); if (dow !== 0 && dow !== 6) n++; }
  return n;
}
/** Working days of [start,end] that fall inside [from,to]. */
export function workingDaysWithin(start: string, end: string, from: string, to: string): number {
  const s = start > from ? start : from, e = end < to ? end : to;
  return s > e ? 0 : workingDays(s, e);
}
export const monthRange = (period: string) => {
  const [y, m] = period.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${period}-01`, to: `${period}-${String(last).padStart(2, "0")}` };
};
export const eachDay = (from: string, to: string) => { const out: string[] = []; for (let t = toUtc(from); t <= toUtc(to); t += DAY) out.push(new Date(t).toISOString().slice(0, 10)); return out; };
export const isWeekday = (ymd: string) => { const d = new Date(toUtc(ymd)).getUTCDay(); return d !== 0 && d !== 6; };

/** The calendar date and minutes-since-midnight of an instant in the tenant's timezone. */
export function localParts(at: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}
export const isLate = (minutes: number, workStart: string, graceMinutes: number) => { const [h, m] = workStart.split(":").map(Number); return minutes > h * 60 + m + graceMinutes; };
export const hoursBetween = (a: Date | null, b: Date | null) => (a && b ? Math.max(0, (b.getTime() - a.getTime()) / 3_600_000) : 0);

export const LEAVE_TYPES: Record<string, string> = { annual: "Annual leave", sick: "Sick leave", maternity: "Maternity leave", paternity: "Paternity leave", compassionate: "Compassionate leave", unpaid: "Unpaid leave" };

/** Converts a local wall-clock time in `tz` (e.g. 2026-11-10 08:05 Africa/Kampala) to the matching UTC instant. */
export function zonedToUtc(ymd: string, hhmm: string, tz: string): Date {
  const [y, m, dd] = ymd.split("-").map(Number); const [h, mi] = hhmm.split(":").map(Number);
  const want = Date.UTC(y, m - 1, dd, h, mi); let guess = want;
  for (let i = 0; i < 2; i++) { const lp = localParts(new Date(guess), tz); const [ly, lm, ld] = lp.ymd.split("-").map(Number); guess -= Date.UTC(ly, lm - 1, ld) + lp.minutes * 60_000 - want; }
  return new Date(guess);
}
export const isRealDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z")) && new Date(s + "T00:00:00Z").toISOString().slice(0, 10) === s;
