import { z } from "zod";
import { and, eq, lte, gte } from "drizzle-orm";
import { contracts, attendanceRecords, leaveRequests } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { getTenant } from "@/lib/hr";
import { localParts, isLate } from "@/lib/hr-calc";

/** Employee self clock-in / clock-out. Time and lateness come from the server clock in the organisation's timezone. */
export const POST = route({ roles: ["worker"] }, async (req, { session, db }) => {
  const { action } = await body(req, z.object({ action: z.enum(["in", "out"]) }));
  const [c] = await db.select().from(contracts).where(and(eq(contracts.workerId, session.userId), eq(contracts.status, "active"))).orderBy(contracts.startDate).limit(1);
  if (!c) throw fail(404, "You need an active contract to record attendance");
  const t = await getTenant(db);
  const now = new Date();
  const { ymd, minutes } = localParts(now, t.timezone);
  if (ymd < c.startDate) throw fail(409, `Your contract starts on ${c.startDate}`);
  const [existing] = await db.select().from(attendanceRecords).where(and(eq(attendanceRecords.contractId, c.id), eq(attendanceRecords.workDate, ymd))).limit(1);

  if (action === "in") {
    if (existing) throw fail(409, "You've already clocked in today");
    const onLeave = await db.select({ id: leaveRequests.id }).from(leaveRequests).where(and(eq(leaveRequests.workerId, session.userId), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, ymd), gte(leaveRequests.endDate, ymd))).limit(1);
    if (onLeave.length) throw fail(409, "You're on approved leave today");
    const late = isLate(minutes, t.workStart, t.lateGraceMinutes);
    await db.insert(attendanceRecords).values({ contractId: c.id, workerId: session.userId, workDate: ymd, clockIn: now, status: late ? "late" : "present", source: "self" });
    return { ok: true, status: late ? "late" : "present" };
  }
  if (!existing || !existing.clockIn) throw fail(409, "You haven't clocked in today");
  if (existing.clockOut) throw fail(409, "You've already clocked out today");
  await db.update(attendanceRecords).set({ clockOut: now }).where(eq(attendanceRecords.id, existing.id));
  return { ok: true };
});
