import { z } from "zod";
import { and, eq, lte, gte } from "drizzle-orm";
import { contracts, attendanceRecords, leaveRequests } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { getTenant, scheduleOf } from "@/lib/hr";
import { localParts, dayMetrics, fmtMinutes } from "@/lib/hr-calc";

/**
 * Employee self clock-in / clock-out.
 * Time comes from the server clock in the organisation's timezone. Lateness and overtime are measured against
 * the working hours written into THIS employee's contract (not a company-wide setting).
 */
export const POST = route({ roles: ["worker"] }, async (req, { session, db }) => {
  const { action } = await body(req, z.object({ action: z.enum(["in", "out"]) }));
  const [c] = await db.select().from(contracts).where(and(eq(contracts.workerId, session.userId), eq(contracts.status, "active"))).orderBy(contracts.startDate).limit(1);
  if (!c) throw fail(404, "You need an active contract to record attendance");
  const t = await getTenant(db);
  const now = new Date();
  const { ymd } = localParts(now, t.timezone);
  if (ymd < c.startDate) throw fail(409, `Your contract starts on ${c.startDate}`);
  const sched = scheduleOf(c);
  const [existing] = await db.select().from(attendanceRecords).where(and(eq(attendanceRecords.contractId, c.id), eq(attendanceRecords.workDate, ymd))).limit(1);

  if (action === "in") {
    if (existing) throw fail(409, "You've already clocked in today");
    const onLeave = await db.select({ id: leaveRequests.id }).from(leaveRequests).where(and(eq(leaveRequests.workerId, session.userId), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, ymd), gte(leaveRequests.endDate, ymd))).limit(1);
    if (onLeave.length) throw fail(409, "You're on approved leave today");
    const m = dayMetrics(sched, t.timezone, ymd, now, null);
    await db.insert(attendanceRecords).values({ contractId: c.id, workerId: session.userId, workDate: ymd, clockIn: now, status: m.status, lateMinutes: m.lateMinutes, source: "self" });
    if (m.lateMinutes > 0) await notify(db, c.employerId, { title: "Late clock-in", body: `${session.name} clocked in ${m.lateMinutes} minutes after the ${sched.workStart} start time.`, link: `/hr/employees/${c.id}` });
    return { ok: true, status: m.status, lateMinutes: m.lateMinutes };
  }
  if (!existing || !existing.clockIn) throw fail(409, "You haven't clocked in today");
  if (existing.clockOut) throw fail(409, "You've already clocked out today");
  const m = dayMetrics(sched, t.timezone, ymd, existing.clockIn, now);
  await db.update(attendanceRecords).set({ clockOut: now, overtimeMinutes: m.overtimeMinutes, overtimeStatus: m.overtimeMinutes > 0 ? "pending" : "none" }).where(eq(attendanceRecords.id, existing.id));
  if (m.overtimeMinutes > 0) await notify(db, c.employerId, { title: "Overtime to approve", body: `${session.name} worked ${fmtMinutes(m.overtimeMinutes)} of overtime today. Approve it so it's paid in the next payroll.`, link: "/hr/attendance", email: true });
  return { ok: true, overtimeMinutes: m.overtimeMinutes };
});
