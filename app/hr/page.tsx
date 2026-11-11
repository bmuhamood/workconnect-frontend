import Link from "next/link";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Users, CalendarCheck, Clock, Wallet, LifeBuoy, ClipboardList } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { leaveRequests, payrollRuns, payrollLines, supportTickets, users } from "@/db/schema";
import { Stat, StatusBadge, Empty, LinkButton } from "@/components/ui";
import { ClockWidget } from "@/components/clock-widget";
import { ActionButton } from "@/components/action-button";
import { activeEmployees, dayStatus, leaveBalances, fmtTime } from "@/lib/hr";
import { localParts, LEAVE_TYPES } from "@/lib/hr-calc";
import { ugx } from "@/lib/format";

export default async function HrOverview() {
  const s = await requireSession();
  const d = await tdb(async (tx, t) => {
    const today = localParts(new Date(), t.timezone).ymd;
    const emps = await activeEmployees(tx, s);
    const days = await dayStatus(tx, t, today, emps);
    if (s.role === "worker") {
      const mine = emps[0]; const st = mine ? days.get(mine.id) : undefined;
      const [slip] = await tx.select({ l: payrollLines, run: payrollRuns }).from(payrollLines).innerJoin(payrollRuns, eq(payrollRuns.id, payrollLines.runId)).where(and(eq(payrollLines.workerId, s.userId), sql`${payrollRuns.status} in ('approved','paid')`)).orderBy(desc(payrollRuns.period)).limit(1);
      const [open] = await tx.select({ n: count() }).from(supportTickets).where(and(eq(supportTickets.requesterId, s.userId), sql`${supportTickets.status} <> 'resolved'`));
      return { kind: "worker" as const, t, mine, st, balances: await leaveBalances(tx, t, s.userId, Number(today.slice(0, 4))), slip, open: open.n };
    }
    const present = [...days.values()].filter((x) => x.status === "present" || x.status === "late").length;
    const onLeave = [...days.values()].filter((x) => x.status === "leave").length;
    const pending = await tx.select({ r: leaveRequests, first: users.firstName, last: users.lastName }).from(leaveRequests).innerJoin(users, eq(users.id, leaveRequests.workerId)).where(and(eq(leaveRequests.status, "pending"), s.role === "employer" ? eq(leaveRequests.employerId, s.userId) : undefined)).orderBy(leaveRequests.startDate).limit(6);
    const [open] = await tx.select({ n: count() }).from(supportTickets).where(sql`${supportTickets.status} <> 'resolved'`);
    const [run] = await tx.select().from(payrollRuns).orderBy(desc(payrollRuns.period)).limit(1);
    const [tot] = run ? await tx.select({ net: sql<number>`coalesce(sum(net_pay),0)::int`, n: count() }).from(payrollLines).where(eq(payrollLines.runId, run.id)) : [null];
    return { kind: "manager" as const, t, today, emps, days, present, onLeave, pending, open: open.n, run, tot };
  });

  if (d.kind === "worker") return (
    <div className="space-y-6">
      {d.mine ? <ClockWidget state={d.st?.status === "leave" ? "leave" : d.st?.clockOut ? "done" : d.st?.clockIn ? "in" : "out"} since={fmtTime(d.st?.clockIn ?? null, d.t.timezone)} /> : <Empty title="No active contract yet" hint="Once you and an employer have both signed a contract, you can clock in, request leave and receive payslips here." />}
      <div className="grid gap-4 sm:grid-cols-3">
        {d.balances.filter((b) => ["annual", "sick"].includes(b.type)).map((b) => <Stat key={b.type} label={`${LEAVE_TYPES[b.type]} left`} value={`${b.left} / ${b.entitled} days`} icon={<CalendarCheck className="size-4" />} />)}
        <Stat label="Open HR requests" value={d.open} icon={<LifeBuoy className="size-4" />} />
      </div>
      <div className="card flex flex-wrap items-center justify-between gap-3 p-6">
        <div><div className="font-semibold">Latest payslip</div><div className="text-sm text-slate-500">{d.slip ? `${d.slip.run.period} · net ${ugx(d.slip.l.netPay)}` : "No payslips yet"}</div></div>
        <div className="flex gap-2">{d.slip && <LinkButton href={`/hr/payroll/${d.slip.run.id}/payslip/${d.slip.l.id}`} variant="secondary">View payslip</LinkButton>}<LinkButton href="/hr/leave">Request leave</LinkButton></div>
      </div>
    </div>
  );
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Employees" value={d.emps.length} icon={<Users className="size-4" />} />
        <Stat label="In today" value={`${d.present} / ${d.emps.length}`} icon={<Clock className="size-4" />} />
        <Stat label="On leave today" value={d.onLeave} icon={<CalendarCheck className="size-4" />} />
        <Stat label="Leave to approve" value={d.pending.length} icon={<ClipboardList className="size-4" />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Leave awaiting approval</h2>
          {d.pending.length === 0 ? <Empty title="Nothing waiting" hint="New leave requests appear here for approval." /> : (
            <div className="card divide-y divide-slate-100">{d.pending.map(({ r, first, last }) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div><div className="font-medium">{first} {last}</div><div className="text-slate-500">{LEAVE_TYPES[r.type] ?? r.type} · {r.days} day(s) · {r.startDate} to {r.endDate}</div></div>
                <div className="flex gap-2"><ActionButton url={`/api/hr/leave/${r.id}`} data={{ action: "approve" }} success="Leave approved">Approve</ActionButton><ActionButton url={`/api/hr/leave/${r.id}`} data={{ action: "reject" }} variant="secondary" confirm="Reject this request?">Reject</ActionButton></div>
              </div>))}</div>)}
        </section>
        <section className="space-y-4">
          {s.role === "admin" && (
            <div className="card p-5">
              <div className="flex items-center gap-2 font-semibold"><Wallet className="size-4 text-accent" />Payroll</div>
              {d.run ? <><div className="mt-2 text-sm text-slate-500">Latest run: {d.run.period}</div><div className="mt-1 flex items-center gap-2"><StatusBadge status={d.run.status} /><span className="text-sm">{d.tot?.n} staff · net {ugx(d.tot?.net ?? 0)}</span></div><Link href={`/hr/payroll/${d.run.id}`} className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-strong">Open run</Link></>
                : <><p className="mt-2 text-sm text-slate-500">No payroll run yet.</p><Link href="/hr/payroll" className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-strong">Create the first run</Link></>}
            </div>)}
          <div className="card p-5"><div className="flex items-center gap-2 font-semibold"><LifeBuoy className="size-4 text-accent" />HR support</div><div className="mt-2 text-sm text-slate-500">{d.open} open request{d.open === 1 ? "" : "s"}</div><Link href="/hr/support" className="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-strong">Open helpdesk</Link></div>
        </section>
      </div>
    </div>
  );
}
void gte; void lte;
