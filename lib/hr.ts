import "server-only";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { contracts, tenants, users, attendanceRecords } from "@/db/schema";
import { parseBands, type PayrollConfig } from "@/lib/hr-calc";
import type { Session } from "@/lib/session";
import { fail } from "@/lib/http";

export type TenantRow = typeof tenants.$inferSelect;
export const getTenant = async (tx: Tx): Promise<TenantRow> => (await tx.select().from(tenants).limit(1))[0];
export const payrollConfig = (t: TenantRow): PayrollConfig => ({ bands: parseBands(t.payeBands), nssfEmployeeBps: t.nssfEmployeeBps, nssfEmployerBps: t.nssfEmployerBps, nssfCap: t.nssfCap });
export const isManager = (s: Session) => s.role === "admin" || s.role === "employer";

/** Contract the caller may act on: admins any, employers their own, workers their own. */
export async function accessibleContract(tx: Tx, id: string, s: Session) {
  const [c] = await tx.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  const ok = c && (s.role === "admin" || c.employerId === s.userId || c.workerId === s.userId);
  if (!ok) throw fail(404, "Employee not found");
  return c;
}

/** "Employees" = workers with an active contract, scoped to what the viewer may see. */
export async function activeEmployees(tx: Tx, s: Session) {
  const scope = s.role === "admin" ? undefined : s.role === "employer" ? eq(contracts.employerId, s.userId) : eq(contracts.workerId, s.userId);
  const rows = await tx.select({ c: contracts, first: users.firstName, last: users.lastName, email: users.email }).from(contracts)
    .innerJoin(users, eq(users.id, contracts.workerId)).where(and(eq(contracts.status, "active"), scope)).orderBy(users.firstName);
  return rows.map((r) => ({ ...r.c, name: `${r.first} ${r.last}`, email: r.email }));
}

import { leaveRequests, payrollLines } from "@/db/schema";
import { computeLine, monthRange, workingDaysWithin, overtimePayFor, type Schedule } from "@/lib/hr-calc";

/** Working days of approved UNPAID leave that fall inside a payroll month. */
export async function unpaidDaysFor(tx: Tx, workerId: string, period: string) {
  const { from, to } = monthRange(period);
  const rows = await tx.select().from(leaveRequests).where(and(eq(leaveRequests.workerId, workerId), eq(leaveRequests.type, "unpaid"), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, to), gte(leaveRequests.endDate, from)));
  return rows.reduce((n, r) => n + workingDaysWithin(r.startDate, r.endDate, from, to), 0);
}
export const lineValues = (basic: number, allowances: number, otherDeductions: number, unpaidDays: number, cfg: ReturnType<typeof payrollConfig>, overtime: { minutes: number; pay: number } = { minutes: 0, pay: 0 }) => {
  const r = computeLine({ basic, allowances, otherDeductions, unpaidDays, overtimePay: overtime.pay }, cfg);
  return { basic, allowances, otherDeductions, unpaidDays, overtimeMinutes: overtime.minutes, overtimePay: overtime.pay, unpaidDeduction: r.unpaidDeduction, gross: r.gross, nssfEmployee: r.nssfEmployee, paye: r.paye, netPay: r.netPay, nssfEmployer: r.nssfEmployer };
};

/** The working schedule written into a contract. */
export const scheduleOf = (c: Schedule): Schedule => ({ workStart: c.workStart, workEnd: c.workEnd, workDays: c.workDays, breakMinutes: c.breakMinutes, lateGraceMinutes: c.lateGraceMinutes, overtimeRateBps: c.overtimeRateBps });

/** APPROVED overtime of one contract inside a payroll month, and what it is worth. */
export async function overtimeFor(tx: Tx, c: { id: string; salary: number } & Schedule, period: string) {
  const { from, to } = monthRange(period);
  const rows = await tx.select({ m: attendanceRecords.overtimeMinutes }).from(attendanceRecords).where(and(eq(attendanceRecords.contractId, c.id), eq(attendanceRecords.overtimeStatus, "approved"), gte(attendanceRecords.workDate, from), lte(attendanceRecords.workDate, to)));
  const minutes = rows.reduce((n, r) => n + r.m, 0);
  return { minutes, pay: overtimePayFor(minutes, c.salary, scheduleOf(c)) };
}
void payrollLines; void inArray;

import { isWorkDay, localParts } from "@/lib/hr-calc";

export type DayState = { status: "present" | "late" | "leave" | "absent" | "notyet" | "off"; clockIn: Date | null; clockOut: Date | null; lateMinutes: number; overtimeMinutes: number; overtimeStatus: string; recordId: string | null };
const blank = { clockIn: null, clockOut: null, lateMinutes: 0, overtimeMinutes: 0, overtimeStatus: "none", recordId: null };
/** Attendance state of each employee on a given local date. */
export async function dayStatus(tx: Tx, t: TenantRow, ymd: string, contractIds: { id: string; workerId: string; workDays?: string }[]): Promise<Map<string, DayState>> {
  const today = localParts(new Date(), t.timezone).ymd;
  const recs = await tx.select().from(attendanceRecords).where(eq(attendanceRecords.workDate, ymd));
  const leave = await tx.select({ w: leaveRequests.workerId }).from(leaveRequests).where(and(eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, ymd), gte(leaveRequests.endDate, ymd)));
  const onLeave = new Set(leave.map((l) => l.w));
  const byContract = new Map(recs.map((r) => [r.contractId, r]));
  return new Map<string, DayState>(contractIds.map((c): [string, DayState] => {
    const r = byContract.get(c.id);
    if (r) return [c.id, { status: r.status as "present" | "late", clockIn: r.clockIn, clockOut: r.clockOut, lateMinutes: r.lateMinutes, overtimeMinutes: r.overtimeMinutes, overtimeStatus: r.overtimeStatus, recordId: r.id }];
    if (onLeave.has(c.workerId)) return [c.id, { status: "leave", ...blank }];
    if (!isWorkDay(ymd, c.workDays ?? "1,2,3,4,5")) return [c.id, { status: "off", ...blank }];
    return [c.id, { status: ymd < today ? "absent" : "notyet", ...blank }];
  }));
}

/** Entitlement, approved and pending days per leave type for one employee in a calendar year. */
export async function leaveBalances(tx: Tx, t: TenantRow, workerId: string, year: number) {
  const rows = await tx.select().from(leaveRequests).where(and(eq(leaveRequests.workerId, workerId), inArray(leaveRequests.status, ["pending", "approved"])));
  return Object.entries(t.leavePolicy).map(([type, entitled]) => {
    const mine = rows.filter((r) => r.type === type && Number(r.startDate.slice(0, 4)) === year);
    const used = mine.filter((r) => r.status === "approved").reduce((n, r) => n + r.days, 0);
    const pending = mine.filter((r) => r.status === "pending").reduce((n, r) => n + r.days, 0);
    return { type, entitled, used, pending, left: Math.max(0, entitled - used - pending) };
  });
}
export const fmtTime = (d: Date | null, tz: string) => (d ? new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d) : "—");

import { eachDay } from "@/lib/hr-calc";
/** Day-by-day attendance for ONE employee over a date range (one query for records, one for leave). */
export async function rangeStatus(tx: Tx, t: TenantRow, c: { id: string; workerId: string; startDate: string; workDays?: string }, from: string, to: string) {
  const today = localParts(new Date(), t.timezone).ymd;
  const recs = await tx.select().from(attendanceRecords).where(and(eq(attendanceRecords.contractId, c.id), gte(attendanceRecords.workDate, from), lte(attendanceRecords.workDate, to)));
  const leave = await tx.select().from(leaveRequests).where(and(eq(leaveRequests.workerId, c.workerId), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, to), gte(leaveRequests.endDate, from)));
  const byDay = new Map(recs.map((r) => [r.workDate, r]));
  return eachDay(from, to).map((ymd) => {
    const r = byDay.get(ymd);
    if (r) return { ymd, status: r.status as string, clockIn: r.clockIn, clockOut: r.clockOut, note: r.note, lateMinutes: r.lateMinutes, overtimeMinutes: r.overtimeMinutes, overtimeStatus: r.overtimeStatus };
    if (leave.some((l) => l.startDate <= ymd && l.endDate >= ymd)) return { ymd, status: "leave", clockIn: null, clockOut: null, note: null, lateMinutes: 0, overtimeMinutes: 0, overtimeStatus: "none" };
    if (!isWorkDay(ymd, c.workDays ?? "1,2,3,4,5") || ymd < c.startDate) return { ymd, status: "off", clockIn: null, clockOut: null, note: null, lateMinutes: 0, overtimeMinutes: 0, overtimeStatus: "none" };
    return { ymd, status: ymd < today ? "absent" : "notyet", clockIn: null, clockOut: null, note: null, lateMinutes: 0, overtimeMinutes: 0, overtimeStatus: "none" };
  });
}
