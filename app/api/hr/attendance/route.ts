import { z } from "zod";
import { attendanceRecords } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { accessibleContract, getTenant, scheduleOf } from "@/lib/hr";
import { isRealDate, zonedToUtc, dayMetrics } from "@/lib/hr-calc";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time like 08:00");
/** Manual attendance entry / correction by a manager (consultancy admin or the employee's client). */
export const POST = route({ roles: ["admin", "employer"] }, async (req, { session, db }) => {
  const d = await body(req, z.object({ contractId: z.string().uuid(), date: z.string().refine(isRealDate, "Choose a date"), clockIn: time, clockOut: time.optional(), note: z.string().trim().max(300).optional() }));
  const c = await accessibleContract(db, d.contractId, session);
  const t = await getTenant(db);
  if (d.clockOut && d.clockOut < d.clockIn) throw fail(400, "Clock-out can't be before clock-in");
  if (d.date < c.startDate) throw fail(400, `The contract starts on ${c.startDate}`);
  const inAt = zonedToUtc(d.date, d.clockIn, t.timezone);
  const outAt = d.clockOut ? zonedToUtc(d.date, d.clockOut, t.timezone) : null;
  const m = dayMetrics(scheduleOf(c), t.timezone, d.date, inAt, outAt);
  // Manager-entered overtime is approved on the spot (the manager is the approver); self-recorded overtime waits for approval.
  const vals = { clockIn: inAt, clockOut: outAt, status: m.status, lateMinutes: m.lateMinutes, overtimeMinutes: m.overtimeMinutes, overtimeStatus: m.overtimeMinutes > 0 ? "approved" : "none", overtimeDecidedBy: m.overtimeMinutes > 0 ? session.userId : null, overtimeDecidedAt: m.overtimeMinutes > 0 ? new Date() : null, source: "manual", note: d.note || null };
  await db.insert(attendanceRecords).values({ contractId: c.id, workerId: c.workerId, workDate: d.date, ...vals }).onConflictDoUpdate({ target: [attendanceRecords.contractId, attendanceRecords.workDate], set: vals });
  return { ok: true, status: vals.status, overtimeMinutes: m.overtimeMinutes };
});
