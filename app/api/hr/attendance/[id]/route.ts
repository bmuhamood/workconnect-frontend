import { z } from "zod";
import { eq } from "drizzle-orm";
import { attendanceRecords, contracts, payrollRuns } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { fmtMinutes } from "@/lib/hr-calc";

/** Approve or reject overtime on one attendance record. Admins decide for any client; a client decides for its own staff. */
export const PATCH = route<{ id: string }>({ roles: ["admin", "employer"] }, async (req, { params, session, db }) => {
  const { action } = await body(req, z.object({ action: z.enum(["approve", "reject"]) }));
  const [r] = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, params.id)).limit(1);
  if (!r) throw fail(404, "Attendance record not found");
  const [c] = await db.select().from(contracts).where(eq(contracts.id, r.contractId)).limit(1);
  if (!c || (session.role === "employer" && c.employerId !== session.userId)) throw fail(404, "Attendance record not found");
  if (r.overtimeMinutes <= 0) throw fail(409, "There is no overtime on this day");
  const [run] = await db.select({ status: payrollRuns.status }).from(payrollRuns).where(eq(payrollRuns.period, r.workDate.slice(0, 7))).limit(1);
  if (run && run.status !== "draft") throw fail(409, "Payroll for that month is already approved, so its overtime is locked");
  const status = action === "approve" ? "approved" : "rejected";
  await db.update(attendanceRecords).set({ overtimeStatus: status, overtimeDecidedBy: session.userId, overtimeDecidedAt: new Date() }).where(eq(attendanceRecords.id, r.id));
  await notify(db, r.workerId, { title: `Overtime ${status}`, body: `Your ${fmtMinutes(r.overtimeMinutes)} of overtime on ${r.workDate} was ${status}${action === "approve" ? " and will be paid with that month's salary" : ""}.`, link: "/hr/attendance" });
  return { ok: true };
});
