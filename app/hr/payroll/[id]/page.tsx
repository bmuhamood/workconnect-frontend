import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { payrollRuns, payrollLines, users } from "@/db/schema";
import { StatusBadge, Stat } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { LineEditor } from "@/components/line-editor";
import { ugx } from "@/lib/format";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSession(["admin"]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await tdb(async (tx, t) => {
    const [run] = await tx.select().from(payrollRuns).where(eq(payrollRuns.id, id)).limit(1);
    if (!run) return null;
    const lines = await tx.select({ l: payrollLines, first: users.firstName, last: users.lastName }).from(payrollLines).innerJoin(users, eq(users.id, payrollLines.workerId)).where(eq(payrollLines.runId, id)).orderBy(users.firstName);
    return { run, lines, t };
  });
  if (!d) notFound();
  const sum = (k: "gross" | "netPay" | "paye" | "nssfEmployee" | "nssfEmployer") => d.lines.reduce((n, x) => n + x.l[k], 0);
  const draft = d.run.status === "draft";
  return (
    <div className="space-y-6">
      <Link href="/hr/payroll" className="text-sm text-slate-500 hover:text-slate-800">← All payroll runs</Link>
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h2 className="text-2xl font-bold">Payroll {d.run.period}</h2><StatusBadge status={d.run.status} /></div>
        <div className="flex flex-wrap gap-2">
          <a href={`/hr/payroll/${d.run.id}/export`} className="inline-flex items-center rounded-xl border border-slate-300/60 bg-slate-100/60 px-4 py-2.5 text-sm font-medium hover:bg-slate-100">Download CSV</a>
          {draft && <><ActionButton url={`/api/hr/payroll/runs/${d.run.id}`} data={{ action: "recalculate" }} variant="secondary" size="md" success="Recalculated">Recalculate</ActionButton><ActionButton url={`/api/hr/payroll/runs/${d.run.id}`} method="DELETE" variant="ghost" size="md" confirm="Delete this draft run?" redirect="/hr/payroll">Delete</ActionButton><ActionButton url={`/api/hr/payroll/runs/${d.run.id}`} data={{ action: "approve" }} size="md" confirm="Approve this payroll? Employees will be notified that payslips are ready." success="Payroll approved">Approve</ActionButton></>}
          {d.run.status === "approved" && <ActionButton url={`/api/hr/payroll/runs/${d.run.id}`} data={{ action: "paid" }} size="md" confirm="Mark this payroll as paid?" success="Marked as paid">Mark as paid</ActionButton>}
        </div></div>
      {draft && !d.t.payrollRatesConfirmedAt && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Approval is locked until you confirm the PAYE and NSSF rates in <Link className="underline" href="/hr/settings">HR settings</Link>.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Gross pay" value={ugx(sum("gross"))} /><Stat label="PAYE" value={ugx(sum("paye"))} /><Stat label="Employee NSSF" value={ugx(sum("nssfEmployee"))} /><Stat label="Net pay" value={ugx(sum("netPay"))} /><Stat label="Employer NSSF" value={ugx(sum("nssfEmployer"))} /></div>
      <div className="card overflow-x-auto"><table className="w-full min-w-[980px] text-sm">
        <thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Employee</th><th className="text-right font-medium">Basic</th><th className="text-right font-medium">Unpaid leave</th><th className="text-right font-medium">Allowances</th><th className="text-right font-medium">Other deductions</th><th className="text-right font-medium">Gross</th><th className="text-right font-medium">PAYE</th><th className="text-right font-medium">NSSF</th><th className="text-right font-medium">Net</th><th className="p-4" /></tr></thead>
        <tbody className="divide-y divide-slate-100">{d.lines.map(({ l, first, last }) => <tr key={l.id}>
          <td className="p-4 font-medium">{first} {last}</td><td className="text-right">{l.basic.toLocaleString()}</td><td className="text-right text-slate-500">{l.unpaidDeduction ? `−${l.unpaidDeduction.toLocaleString()} (${l.unpaidDays}d)` : "—"}</td>
          <LineEditor id={l.id} allowances={l.allowances} otherDeductions={l.otherDeductions} editable={draft} />
          <td className="text-right">{l.gross.toLocaleString()}</td><td className="text-right">{l.paye.toLocaleString()}</td><td className="text-right">{l.nssfEmployee.toLocaleString()}</td><td className="text-right font-semibold">{l.netPay.toLocaleString()}</td>
          <td className="p-4 text-right"><Link className="text-accent hover:text-accent-strong" href={`/hr/payroll/${d.run.id}/payslip/${l.id}`}>Payslip</Link></td></tr>)}</tbody></table></div>
    </div>
  );
}
