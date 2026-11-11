import { z } from "zod";
import { attendanceRecords } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { accessibleContract, getTenant } from "@/lib/hr";
import { isLate, isRealDate, localParts, zonedToUtc } from "@/lib/hr-calc";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time like 08:00");
/** Manual attendance entry / correction by a manager (admin or the employee's employer). */
export const POST = route({ roles: ["admin", "employer"] }, async (req, { session, db }) => {
  const d = await body(req, z.object({ contractId: z.string().uuid(), date: z.string().refine(isRealDate, "Choose a date"), clockIn: time, clockOut: time.optional(), note: z.string().trim().max(300).optional() }));
  const c = await accessibleContract(db, d.contractId, session);
  const t = await getTenant(db);
  if (d.clockOut && d.clockOut < d.clockIn) throw fail(400, "Clock-out can't be before clock-in");
  if (d.date < c.startDate) throw fail(400, `The contract starts on ${c.startDate}`);
  const inAt = zonedToUtc(d.date, d.clockIn, t.timezone);
  const late = isLate(localParts(inAt, t.timezone).minutes, t.workStart, t.lateGraceMinutes);
  const vals = { clockIn: inAt, clockOut: d.clockOut ? zonedToUtc(d.date, d.clockOut, t.timezone) : null, status: late ? "late" : "present", source: "manual", note: d.note || null };
  await db.insert(attendanceRecords).values({ contractId: c.id, workerId: c.workerId, workDate: d.date, ...vals }).onConflictDoUpdate({ target: [attendanceRecords.contractId, attendanceRecords.workDate], set: vals });
  return { ok: true, status: vals.status };
});
