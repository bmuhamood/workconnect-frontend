import { notFound } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { contracts, users, leaveRequests, payrollLines, payrollRuns } from "@/db/schema";
import { Avatar, StatusBadge } from "@/components/ui";
import { DayBadge } from "@/components/day-badge";
import { AjaxForm, Field } from "@/components/ajax-form";
import { leaveBalances, rangeStatus, fmtTime } from "@/lib/hr";
import { eachDay, localParts, LEAVE_TYPES, hoursBetween } from "@/lib/hr-calc";
import { ugx } from "@/lib/format";

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireSession(["admin", "employer"]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await tdb(async (tx, t) => {
    const [c] = await tx.select().from(contracts).where(eq(contracts.id, id)).limit(1);
    if (!c || (s.role === "employer" && c.employerId !== s.userId)) return null;
    const [w] = await tx.select({ first: users.firstName, last: users.lastName, email: users.email, phone: users.phone, avatar: users.avatarUrl }).from(users).where(eq(users.id, c.workerId));
    const [e] = await tx.select({ first: users.firstName, last: users.lastName }).from(users).where(eq(users.id, c.employerId));
    const today = localParts(new Date(), t.timezone).ymd;
    const from = eachDay(today, today).length ? new Date(Date.parse(today + "T00:00:00Z") - 13 * 86_400_000).toISOString().slice(0, 10) : today;
    return {
      t, c, w, e, today,
      bal: await leaveBalances(tx, t, c.workerId, Number(today.slice(0, 4))),
      days: (await rangeStatus(tx, t, c, from, today)).reverse(),
      leave: await tx.select().from(leaveRequests).where(eq(leaveRequests.contractId, c.id)).orderBy(desc(leaveRequests.startDate)).limit(8),
      pay: s.role === "admin" ? await tx.select({ l: payrollLines, run: payrollRuns }).from(payrollLines).innerJoin(payrollRuns, eq(payrollRuns.id, payrollLines.runId)).where(and(eq(payrollLines.contractId, c.id))).orderBy(desc(payrollRuns.period)).limit(6) : [],
    };
  });
  if (!d) notFound();
  const name = `${d.w.first} ${d.w.last}`;
  return (
    <div className="space-y-6">
      <Link href="/hr/employees" className="text-sm text-slate-500 hover:text-slate-800">← All employees</Link>
      <div className="card flex flex-wrap items-center gap-5 p-6">
        <Avatar name={name} src={d.w.avatar} size={64} />
        <div className="min-w-0 flex-1"><h2 className="text-2xl font-bold">{name}</h2><p className="text-slate-500">{d.c.title} · for {d.e.first} {d.e.last}</p><p className="mt-1 text-sm text-slate-500">{d.w.email}{d.w.phone ? ` · ${d.w.phone}` : ""}</p></div>
        <dl className="grid grid-cols-3 gap-6 text-sm"><div><dt className="text-slate-400">Started</dt><dd className="font-semibold">{d.c.startDate}</dd></div><div><dt className="text-slate-400">Hours / week</dt><dd className="font-semibold">{d.c.hoursPerWeek}</dd></div><div><dt className="text-slate-400">Monthly salary</dt><dd className="font-semibold">{ugx(d.c.salary)}</dd></div></dl>
        <Link href={`/contracts/${d.c.id}`} className="text-sm font-medium text-accent hover:text-accent-strong">View contract</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6"><h3 className="mb-4 font-semibold">Leave balances ({d.today.slice(0, 4)})</h3>
          <table className="w-full text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-2 font-medium">Type</th><th className="font-medium">Entitled</th><th className="font-medium">Used</th><th className="font-medium">Pending</th><th className="font-medium">Left</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{d.bal.map((b) => <tr key={b.type}><td className="py-2.5">{LEAVE_TYPES[b.type]}</td><td>{b.entitled}</td><td>{b.used}</td><td>{b.pending}</td><td className="font-semibold">{b.left}</td></tr>)}</tbody></table></section>
        <section className="card p-6"><h3 className="mb-4 font-semibold">Leave history</h3>
          {d.leave.length === 0 ? <p className="text-sm text-slate-400">No leave taken or requested.</p> : <ul className="divide-y divide-slate-100 text-sm">{d.leave.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 py-2.5"><span>{LEAVE_TYPES[l.type] ?? l.type} · {l.days}d <span className="text-slate-400">{l.startDate} → {l.endDate}</span></span><StatusBadge status={l.status} /></li>)}</ul>}</section>
      </div>
      <section className="card p-6"><h3 className="mb-4 font-semibold">Last 14 days</h3>
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="text-left text-slate-400"><tr><th className="pb-2 font-medium">Date</th><th className="font-medium">Status</th><th className="font-medium">In</th><th className="font-medium">Out</th><th className="font-medium">Hours</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{d.days.map((x) => <tr key={x.ymd}><td className="py-2.5">{x.ymd}</td><td><DayBadge status={x.status} /></td><td>{fmtTime(x.clockIn, d.t.timezone)}</td><td>{fmtTime(x.clockOut, d.t.timezone)}</td><td>{x.clockOut ? hoursBetween(x.clockIn, x.clockOut).toFixed(1) : "—"}</td></tr>)}</tbody></table></div>
        <div className="mt-6 border-t border-slate-100 pt-5"><h4 className="mb-3 text-sm font-semibold">Add or correct a day</h4>
          <AjaxForm url="/api/hr/attendance" submit="Save attendance" success="Attendance saved" extra={{ contractId: d.c.id }} className="grid items-end gap-3 sm:grid-cols-5">
            <Field label="Date"><input type="date" name="date" required max={d.today} className="input" /></Field><Field label="In"><input type="time" name="clockIn" required className="input" /></Field><Field label="Out"><input type="time" name="clockOut" className="input" /></Field><div className="sm:col-span-2"><Field label="Note"><input name="note" className="input" /></Field></div>
          </AjaxForm></div></section>
      {s.role === "admin" && d.pay.length > 0 && (
        <section className="card p-6"><h3 className="mb-4 font-semibold">Payroll history</h3>
          <ul className="divide-y divide-slate-100 text-sm">{d.pay.map(({ l, run }) => <li key={l.id} className="flex items-center justify-between py-2.5"><span>{run.period} <span className="text-slate-400">gross {ugx(l.gross)}</span></span><span className="flex items-center gap-3"><b>{ugx(l.netPay)}</b><StatusBadge status={run.status} /><Link className="text-accent hover:text-accent-strong" href={`/hr/payroll/${run.id}/payslip/${l.id}`}>Payslip</Link></span></li>)}</ul></section>)}
    </div>
  );
}
