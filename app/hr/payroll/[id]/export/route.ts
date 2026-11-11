import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { withTenant } from "@/lib/db";
import { payrollRuns, payrollLines, users } from "@/db/schema";

const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s || s.role !== "admin") return new Response("Forbidden", { status: 403 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const out = await withTenant({ tenantId: s.tenantId, userId: s.userId }, async (tx) => {
    const [run] = await tx.select().from(payrollRuns).where(eq(payrollRuns.id, id)).limit(1);
    if (!run) return null;
    const rows = await tx.select({ l: payrollLines, first: users.firstName, last: users.lastName, email: users.email }).from(payrollLines).innerJoin(users, eq(users.id, payrollLines.workerId)).where(eq(payrollLines.runId, id)).orderBy(users.firstName);
    return { run, rows };
  });
  if (!out) return new Response("Not found", { status: 404 });
  const head = ["Employee", "Email", "Basic", "Unpaid leave days", "Unpaid leave deduction", "Overtime hours", "Overtime pay", "Allowances", "Other deductions", "Gross", "PAYE", "Employee NSSF", "Net pay", "Employer NSSF"];
  const lines = out.rows.map(({ l, first, last, email }) => [`${first} ${last}`, email, l.basic, l.unpaidDays, l.unpaidDeduction, (l.overtimeMinutes / 60).toFixed(2), l.overtimePay, l.allowances, l.otherDeductions, l.gross, l.paye, l.nssfEmployee, l.netPay, l.nssfEmployer].map(q).join(","));
  return new Response([head.map(q).join(","), ...lines].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="payroll-${out.run.period}.csv"` } });
}
