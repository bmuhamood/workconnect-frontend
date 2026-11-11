import { z } from "zod";
import { eq } from "drizzle-orm";
import { payrollRuns, payrollLines } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { getTenant, payrollConfig, unpaidDaysFor, lineValues } from "@/lib/hr";

export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, db }) => {
  const { action } = await body(req, z.object({ action: z.enum(["recalculate", "approve", "paid"]) }));
  const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, params.id)).limit(1);
  if (!run) throw fail(404, "Payroll run not found");
  const t = await getTenant(db);
  const lines = await db.select().from(payrollLines).where(eq(payrollLines.runId, run.id));

  if (action === "recalculate") {
    if (run.status !== "draft") throw fail(409, "Only a draft run can be recalculated");
    const cfg = payrollConfig(t);
    for (const l of lines) await db.update(payrollLines).set(lineValues(l.basic, l.allowances, l.otherDeductions, await unpaidDaysFor(db, l.workerId, run.period), cfg)).where(eq(payrollLines.id, l.id));
    return { ok: true };
  }
  if (action === "approve") {
    if (run.status !== "draft") throw fail(409, "This run was already approved");
    if (!t.payrollRatesConfirmedAt) throw fail(409, "Confirm the PAYE and NSSF rates in HR settings before approving payroll.");
    await db.update(payrollRuns).set({ status: "approved", approvedAt: new Date() }).where(eq(payrollRuns.id, run.id));
    for (const l of lines) await notify(db, l.workerId, { title: `Payslip ready: ${run.period}`, body: `Your payslip for ${run.period} is ready to view.`, link: `/hr/payroll/${run.id}/payslip/${l.id}`, email: true });
    return { ok: true };
  }
  if (run.status !== "approved") throw fail(409, "Approve the run before marking it paid");
  await db.update(payrollRuns).set({ status: "paid", paidAt: new Date() }).where(eq(payrollRuns.id, run.id));
  return { ok: true };
});

export const DELETE = route<{ id: string }>({ roles: ["admin"] }, async (_req, { params, db }) => {
  const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, params.id)).limit(1);
  if (!run) throw fail(404, "Payroll run not found");
  if (run.status !== "draft") throw fail(409, "Only a draft run can be deleted");
  await db.delete(payrollRuns).where(eq(payrollRuns.id, run.id));
  return { ok: true };
});
