import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { leaveRequests, users } from "@/db/schema";
import { Empty, StatusBadge, Stat, cn } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ActionButton } from "@/components/action-button";
import { activeEmployees, leaveBalances } from "@/lib/hr";
import { eachDay, isWeekday, localParts, monthRange, LEAVE_TYPES } from "@/lib/hr-calc";

export const metadata: Metadata = { title: "Leave" };
const shift = (p: string, n: number) => { const [y, m] = p.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); return d.toISOString().slice(0, 7); };

export default async function Leave({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const d = await tdb(async (tx, t) => {
    const today = localParts(new Date(), t.timezone).ymd;
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month ?? "") ? sp.month! : today.slice(0, 7);
    const { from, to } = monthRange(month);
    const scope = s.role === "worker" ? eq(leaveRequests.workerId, s.userId) : s.role === "employer" ? eq(leaveRequests.employerId, s.userId) : undefined;
    const emps = await activeEmployees(tx, s);
    const list = await tx.select({ r: leaveRequests, first: users.firstName, last: users.lastName }).from(leaveRequests).innerJoin(users, eq(users.id, leaveRequests.workerId)).where(scope).orderBy(desc(leaveRequests.createdAt)).limit(40);
    const off = s.role === "worker" ? [] : await tx.select().from(leaveRequests).where(and(eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, to), gte(leaveRequests.endDate, from), scope));
    return { t, today, month, from, to, emps, list, off, bal: s.role === "worker" ? await leaveBalances(tx, t, s.userId, Number(today.slice(0, 4))) : [] };
  });
  const days = eachDay(d.from, d.to);
  const myContract = s.role === "worker" ? d.emps[0] : null;
  return (
    <div className="space-y-8">
      {s.role === "worker" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">{d.bal.map((b) => <Stat key={b.type} label={LEAVE_TYPES[b.type]} value={<>{b.left}<span className="text-base font-normal text-slate-400"> / {b.entitled} left</span></>} />)}</div>
          {myContract ? (
            <section className="card p-6"><h2 className="mb-4 text-lg font-bold">Request leave</h2>
              <AjaxForm url="/api/hr/leave" submit="Submit request" success="Leave requested" extra={{ contractId: myContract.id }} reset className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Type"><select name="type" required defaultValue="annual" className="input">{Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
                <Field label="From"><input type="date" name="startDate" required className="input" /></Field><Field label="To"><input type="date" name="endDate" required className="input" /></Field>
                <div className="sm:col-span-2 lg:col-span-4"><Field label="Reason (optional)"><input name="reason" className="input" /></Field></div>
              </AjaxForm></section>
          ) : <Empty title="No active contract" hint="You can request leave once you have a signed, active contract." />}
        </>
      )}
      <section>
        <h2 className="mb-3 text-lg font-bold">{s.role === "worker" ? "My requests" : "Leave requests"}</h2>
        {d.list.length === 0 ? <Empty title="No leave requests" /> : (
          <div className="card divide-y divide-slate-100">{d.list.map(({ r, first, last }) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div><div className="font-medium">{s.role === "worker" ? LEAVE_TYPES[r.type] : `${first} ${last} · ${LEAVE_TYPES[r.type]}`} · {r.days} day(s)</div><div className="text-slate-500">{r.startDate} to {r.endDate}{r.reason ? ` · ${r.reason}` : ""}{r.decisionNote ? ` · Note: ${r.decisionNote}` : ""}</div></div>
              <div className="flex items-center gap-2"><StatusBadge status={r.status} />
                {r.status === "pending" && s.role !== "worker" && <><ActionButton url={`/api/hr/leave/${r.id}`} data={{ action: "approve" }} success="Leave approved">Approve</ActionButton><ActionButton url={`/api/hr/leave/${r.id}`} data={{ action: "reject" }} variant="secondary" confirm="Reject this request?">Reject</ActionButton></>}
                {s.role === "worker" && (r.status === "pending" || (r.status === "approved" && r.startDate > d.today)) && <ActionButton url={`/api/hr/leave/${r.id}`} data={{ action: "cancel" }} variant="secondary" confirm="Cancel this request?">Cancel</ActionButton>}</div>
            </div>))}</div>)}
      </section>
      {s.role !== "worker" && (
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Who's off · {d.month}</h2><div className="flex gap-2 text-sm"><Link className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100" href={`/hr/leave?month=${shift(d.month, -1)}`}>← Previous</Link><Link className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100" href={`/hr/leave?month=${shift(d.month, 1)}`}>Next →</Link></div></div>
          {d.emps.length === 0 ? <Empty title="No employees" /> : (
            <div className="card overflow-x-auto p-4"><table className="w-full border-separate border-spacing-y-1 text-xs"><thead><tr><th className="sticky left-0 min-w-36 bg-[#0d1326] pr-3 text-left font-medium text-slate-400">Employee</th>{days.map((x) => <th key={x} className={cn("w-7 min-w-7 text-center font-medium", isWeekday(x) ? "text-slate-400" : "text-slate-300/40")}>{Number(x.slice(8))}</th>)}</tr></thead>
              <tbody>{d.emps.map((e) => <tr key={e.id}><td className="sticky left-0 bg-[#0d1326] pr-3 text-sm font-medium">{e.name}</td>{days.map((x) => {
                const l = d.off.find((o) => o.workerId === e.workerId && o.startDate <= x && o.endDate >= x);
                return <td key={x} title={l ? `${LEAVE_TYPES[l.type]}` : undefined} className={cn("h-7 rounded", l ? (l.type === "sick" ? "bg-rose-500/60" : l.type === "unpaid" ? "bg-amber-400/50" : "bg-brand-500/70") : isWeekday(x) ? "bg-slate-100/50" : "bg-transparent")} />;
              })}</tr>)}</tbody></table>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span><i className="mr-1.5 inline-block size-2.5 rounded bg-brand-500/70" />Paid leave</span><span><i className="mr-1.5 inline-block size-2.5 rounded bg-rose-500/60" />Sick</span><span><i className="mr-1.5 inline-block size-2.5 rounded bg-amber-400/50" />Unpaid</span></div></div>)}
        </section>)}
    </div>
  );
}
