import { z } from "zod";
import { and, eq, gte, inArray, isNotNull, lte, or } from "drizzle-orm";
import { contracts, payrollRuns, payrollLines } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { getTenant, payrollConfig, unpaidDaysFor, lineValues } from "@/lib/hr";
import { monthRange } from "@/lib/hr-calc";

/** Creates a draft payroll run for a month with one line per employee on a live contract. */
export const POST = route({ roles: ["admin"] }, async (req, { session, db }) => {
  const { period } = await body(req, z.object({ period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose a month") }));
  if ((await db.select({ id: payrollRuns.id }).from(payrollRuns).where(eq(payrollRuns.period, period)).limit(1)).length) throw fail(409, `A payroll run for ${period} already exists`);
  const { from, to } = monthRange(period);
  const staff = await db.select().from(contracts).where(and(isNotNull(contracts.activatedAt), lte(contracts.startDate, to), inArray(contracts.status, ["active", "completed", "terminated"]), or(eq(contracts.status, "active"), gte(contracts.endedAt, new Date(from + "T00:00:00Z")))));
  if (!staff.length) throw fail(400, `No employees were on a live contract in ${period}`);
  const cfg = payrollConfig(await getTenant(db));
  const [run] = await db.insert(payrollRuns).values({ period, createdBy: session.userId }).returning({ id: payrollRuns.id });
  for (const c of staff) await db.insert(payrollLines).values({ runId: run.id, contractId: c.id, workerId: c.workerId, employerId: c.employerId, ...lineValues(c.salary, 0, 0, await unpaidDaysFor(db, c.workerId, period), cfg) });
  return { id: run.id, lines: staff.length };
});
