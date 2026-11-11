import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { AlertTriangle } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { payrollRuns, payrollLines } from "@/db/schema";
import { Empty, StatusBadge } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ugx } from "@/lib/format";
import { localParts } from "@/lib/hr-calc";

export const metadata: Metadata = { title: "Payroll" };
export default async function Payroll() {
  const s = await requireSession(["admin", "worker"]);
  const d = await tdb(async (tx, t) => {
    const month = localParts(new Date(), t.timezone).ymd.slice(0, 7);
    if (s.role === "worker") return { kind: "worker" as const, month, slips: await tx.select({ l: payrollLines, run: payrollRuns }).from(payrollLines).innerJoin(payrollRuns, eq(payrollRuns.id, payrollLines.runId)).where(sql`${payrollLines.workerId} = ${s.userId} and ${payrollRuns.status} in ('approved','paid')`).orderBy(desc(payrollRuns.period)) };
    const runs = await tx.select({ run: payrollRuns, n: sql<number>`count(${payrollLines.id})::int`, gross: sql<number>`coalesce(sum(${payrollLines.gross}),0)::int`, net: sql<number>`coalesce(sum(${payrollLines.netPay}),0)::int`, er: sql<number>`coalesce(sum(${payrollLines.nssfEmployer}),0)::int` }).from(payrollRuns).leftJoin(payrollLines, eq(payrollLines.runId, payrollRuns.id)).groupBy(payrollRuns.id).orderBy(desc(payrollRuns.period));
    return { kind: "admin" as const, month, t, runs };
  });
  if (d.kind === "worker") return (
    <div>
      <h2 className="mb-4 text-lg font-bold">My payslips</h2>
      {d.slips.length === 0 ? <Empty title="No payslips yet" hint="Payslips appear here once payroll for a month is approved." /> :
        <div className="card divide-y divide-slate-100">{d.slips.map(({ l, run }) => <Link key={l.id} href={`/hr/payroll/${run.id}/payslip/${l.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-100/40"><div><div className="font-medium">{run.period}</div><div className="text-sm text-slate-500">Gross {ugx(l.gross)}</div></div><div className="flex items-center gap-3"><b>{ugx(l.netPay)}</b><StatusBadge status={run.status} /></div></Link>)}</div>}
    </div>
  );
  return (
    <div className="space-y-8">
      {!d.t.payrollRatesConfirmedAt && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-600/40 bg-amber-50 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div><div className="font-semibold text-amber-700">Confirm statutory rates before approving payroll</div><p className="mt-1 text-slate-600">PAYE bands and NSSF rates change. Check them against URA and NSSF guidance, then confirm them in <Link href="/hr/settings" className="text-accent underline">HR settings</Link>. You can still create and review draft runs.</p></div>
        </div>)}
      <section className="card p-6"><h2 className="mb-4 text-lg font-bold">Create a payroll run</h2>
        <AjaxForm url="/api/hr/payroll/runs" submit="Generate payroll" success="Payroll run created" className="flex flex-wrap items-end gap-4">
          <Field label="Month"><input type="month" name="period" required defaultValue={d.month} className="input" /></Field>
        </AjaxForm>
        <p className="mt-3 text-xs text-slate-500">One line per employee on a live contract, using full monthly salary. Approved unpaid leave is deducted. You can add allowances and deductions before approving.</p></section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Payroll runs</h2>
        {d.runs.length === 0 ? <Empty title="No payroll runs yet" hint="Generate your first run above." /> : (
          <div className="card overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Period</th><th className="font-medium">Status</th><th className="font-medium">Staff</th><th className="text-right font-medium">Gross</th><th className="text-right font-medium">Net pay</th><th className="text-right font-medium">Employer NSSF</th><th className="p-4" /></tr></thead>
            <tbody className="divide-y divide-slate-100">{d.runs.map(({ run, n, gross, net, er }) => <tr key={run.id}><td className="p-4 font-medium">{run.period}</td><td><StatusBadge status={run.status} /></td><td>{n}</td><td className="text-right">{ugx(gross)}</td><td className="text-right font-semibold">{ugx(net)}</td><td className="text-right text-slate-500">{ugx(er)}</td><td className="p-4 text-right"><Link href={`/hr/payroll/${run.id}`} className="font-medium text-accent hover:text-accent-strong">Open</Link></td></tr>)}</tbody></table></div>)}
      </section>
    </div>
  );
}
