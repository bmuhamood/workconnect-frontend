import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { payrollRuns, payrollLines, users, contracts } from "@/db/schema";
import { PrintButton } from "@/components/print-button";
import { ugx } from "@/lib/format";

export default async function Payslip({ params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { id, lineId } = await params;
  const s = await requireSession(["admin", "worker", "employer"]);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(lineId)) notFound();
  const d = await tdb(async (tx, t) => {
    const [row] = await tx.select({ l: payrollLines, run: payrollRuns }).from(payrollLines).innerJoin(payrollRuns, eq(payrollRuns.id, payrollLines.runId)).where(and(eq(payrollLines.id, lineId), eq(payrollRuns.id, id))).limit(1);
    if (!row || (s.role === "worker" && row.l.workerId !== s.userId) || (s.role === "employer" && row.l.employerId !== s.userId) || (s.role !== "admin" && row.run.status === "draft")) return null;
    const [w] = await tx.select({ first: users.firstName, last: users.lastName, email: users.email }).from(users).where(eq(users.id, row.l.workerId));
    const [c] = await tx.select({ title: contracts.title }).from(contracts).where(eq(contracts.id, row.l.contractId));
    return { ...row, w, c, t };
  });
  if (!d) notFound();
  const { l, run, w, c, t } = d;
  const rows: [string, number, boolean?][] = [["Basic salary", l.basic], ...(l.overtimePay ? [[`Overtime (${Math.floor(l.overtimeMinutes / 60)}h ${String(l.overtimeMinutes % 60).padStart(2, "0")}m, approved)`, l.overtimePay] as [string, number]] : []), ...(l.allowances ? [["Allowances", l.allowances] as [string, number]] : []), ...(l.unpaidDeduction ? [[`Unpaid leave (${l.unpaidDays} day${l.unpaidDays === 1 ? "" : "s"})`, -l.unpaidDeduction] as [string, number]] : [])];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between print:hidden"><Link href={s.role === "admin" ? `/hr/payroll/${run.id}` : "/hr/payroll"} className="text-sm text-slate-500 hover:text-slate-800">← Back</Link><PrintButton /></div>
      <article className="card p-8 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6"><div><div className="font-display text-xl font-bold">{t.name}</div><div className="text-sm text-slate-500">Payslip</div></div><div className="text-right"><div className="font-display text-lg font-semibold">{run.period}</div>{run.status === "draft" && <div className="text-xs font-semibold text-amber-700">DRAFT</div>}</div></header>
        <dl className="grid gap-4 border-b border-slate-200 py-6 text-sm sm:grid-cols-2"><div><dt className="text-slate-400">Employee</dt><dd className="font-semibold">{w.first} {w.last}</dd><dd className="text-slate-500">{w.email}</dd></div><div><dt className="text-slate-400">Role</dt><dd className="font-semibold">{c?.title}</dd></div></dl>
        <table className="mt-6 w-full text-sm"><tbody>
          <tr><th colSpan={2} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Earnings</th></tr>
          {rows.map(([k, v]) => <tr key={k}><td className="py-1.5">{k}</td><td className="py-1.5 text-right">{ugx(v)}</td></tr>)}
          <tr className="border-t border-slate-200 font-semibold"><td className="py-2">Gross pay</td><td className="py-2 text-right">{ugx(l.gross)}</td></tr>
          <tr><th colSpan={2} className="pb-2 pt-5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Deductions</th></tr>
          <tr><td className="py-1.5">PAYE</td><td className="py-1.5 text-right">{ugx(l.paye)}</td></tr>
          <tr><td className="py-1.5">NSSF (employee {t.nssfEmployeeBps / 100}%)</td><td className="py-1.5 text-right">{ugx(l.nssfEmployee)}</td></tr>
          {l.otherDeductions > 0 && <tr><td className="py-1.5">Other deductions</td><td className="py-1.5 text-right">{ugx(l.otherDeductions)}</td></tr>}
          <tr className="border-t-2 border-slate-300 text-base font-bold"><td className="pt-4">Net pay</td><td className="pt-4 text-right">{ugx(l.netPay)}</td></tr>
        </tbody></table>
        <p className="mt-8 text-xs leading-relaxed text-slate-400">Employer NSSF contribution ({t.nssfEmployerBps / 100}%): {ugx(l.nssfEmployer)}. This is paid by the employer and is not deducted from your pay.</p>
      </article>
    </div>
  );
}
