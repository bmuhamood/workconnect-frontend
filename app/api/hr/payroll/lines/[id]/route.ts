import { z } from "zod";
import { eq } from "drizzle-orm";
import { payrollLines, payrollRuns } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { getTenant, payrollConfig, lineValues } from "@/lib/hr";

export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, db }) => {
  const d = await body(req, z.object({ allowances: z.coerce.number().int().min(0).max(100_000_000), otherDeductions: z.coerce.number().int().min(0).max(100_000_000) }));
  const [l] = await db.select().from(payrollLines).where(eq(payrollLines.id, params.id)).limit(1);
  if (!l) throw fail(404, "Payroll line not found");
  const [run] = await db.select().from(payrollRuns).where(eq(payrollRuns.id, l.runId)).limit(1);
  if (run.status !== "draft") throw fail(409, "Approved payroll can't be edited");
  await db.update(payrollLines).set(lineValues(l.basic, d.allowances, d.otherDeductions, l.unpaidDays, payrollConfig(await getTenant(db)), { minutes: l.overtimeMinutes, pay: l.overtimePay })).where(eq(payrollLines.id, l.id));
  return { ok: true };
});
