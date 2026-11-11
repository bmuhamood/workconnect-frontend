import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { attendanceRecords, contracts, users } from "@/db/schema";
import { Empty, Stat, StatusBadge } from "@/components/ui";
import { DayBadge } from "@/components/day-badge";
import { ClockWidget } from "@/components/clock-widget";
import { ActionButton } from "@/components/action-button";
import { AjaxForm, Field } from "@/components/ajax-form";
import { activeEmployees, dayStatus, rangeStatus, fmtTime, overtimeFor } from "@/lib/hr";
import { isRealDate, localParts, hoursBetween, describeSchedule, fmtMinutes, hourlyRate, overtimePayFor } from "@/lib/hr-calc";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Attendance" };
const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);
const th = "font-medium";

function OvertimeCell({ minutes, status }: { minutes: number; status: string }) {
  if (minutes <= 0) return <span className="text-slate-400">—</span>;
  return <span className="inline-flex items-center gap-2">{fmtMinutes(minutes)}<StatusBadge status={status} /></span>;
}

export default async function Attendance({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const d = await tdb(async (tx, t) => {
    const today = localParts(new Date(), t.timezone).ymd;
    const date = sp.date && isRealDate(sp.date) && sp.date <= today ? sp.date : today;
    const emps = await activeEmployees(tx, s);
    if (s.role === "worker") {
      const me = emps[0];
      const rows = me ? (await rangeStatus(tx, t, me, addDays(today, -13), today)).reverse() : [];
      const month = today.slice(0, 7);
      const ot = me ? await overtimeFor(tx, me, month) : { minutes: 0, pay: 0 };
      return { kind: "worker" as const, t, today, me, rows, month, ot };
    }
    // overtime awaiting a decision in the last 45 days (clients only see their own staff)
    const pendingRows = await tx.select({ r: attendanceRecords, c: contracts, first: users.firstName, last: users.lastName }).from(attendanceRecords)
      .innerJoin(contracts, eq(contracts.id, attendanceRecords.contractId)).innerJoin(users, eq(users.id, attendanceRecords.workerId))
      .where(and(eq(attendanceRecords.overtimeStatus, "pending"), gte(attendanceRecords.workDate, addDays(today, -45)), s.role === "employer" ? eq(contracts.employerId, s.userId) : undefined))
      .orderBy(desc(attendanceRecords.workDate)).limit(40);
    return { kind: "manager" as const, t, today, date, emps, pendingRows, days: await dayStatus(tx, t, date, emps) };
  });
  const tz = d.t.timezone;

  if (d.kind === "worker") {
    const today = d.rows.find((r) => r.ymd === d.today);
    return (
      <div className="space-y-6">
        {d.me ? <ClockWidget state={today?.status === "leave" ? "leave" : today?.clockOut ? "done" : today?.clockIn ? "in" : "out"} since={fmtTime(today?.clockIn ?? null, tz)} /> : <Empty title="No active contract" hint="You can clock in once you have a signed, active contract." />}
        {d.me && (
          <div className="card space-y-3 p-5 text-sm">
            <h2 className="font-semibold">Your working hours (from your contract)</h2>
            <p className="leading-relaxed text-slate-600">{describeSchedule(d.me)} Times are in {tz}.</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Hourly rate (approx.)" value={ugx(Math.round(hourlyRate(d.me.salary, d.me)))} />
              <Stat label={`Approved overtime · ${d.month}`} value={fmtMinutes(d.ot.minutes)} />
              <Stat label="Overtime pay this month" value={ugx(d.ot.pay)} />
            </div>
          </div>)}
        {d.rows.length > 0 && <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><caption className="sr-only">Your attendance for the last 14 days</caption><thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Date</th><th scope="col" className={th}>Status</th><th scope="col" className={th}>In</th><th scope="col" className={th}>Out</th><th scope="col" className={th}>Late by</th><th scope="col" className={th}>Overtime</th><th scope="col" className="p-4 font-medium">Hours</th></tr></thead>
          <tbody className="divide-y divide-slate-200">{d.rows.map((r) => <tr key={r.ymd}><td className="p-4">{r.ymd}</td><td><DayBadge status={r.status} /></td><td>{fmtTime(r.clockIn, tz)}</td><td>{fmtTime(r.clockOut, tz)}</td><td>{r.lateMinutes > 0 ? `${r.lateMinutes} min` : "—"}</td><td><OvertimeCell minutes={r.overtimeMinutes} status={r.overtimeStatus} /></td><td className="p-4">{r.clockOut ? hoursBetween(r.clockIn, r.clockOut).toFixed(1) : "—"}</td></tr>)}</tbody></table></div>}
      </div>
    );
  }

  const vals = [...d.days.values()];
  const c = (k: string) => vals.filter((v) => v.status === k).length;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{d.date === d.today ? "Today" : d.date}</h2>
        <div className="flex gap-2 text-sm"><Link className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100" href={`/hr/attendance?date=${addDays(d.date, -1)}`}>← Previous day</Link>{d.date < d.today && <Link className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-100" href={`/hr/attendance?date=${addDays(d.date, 1)}`}>Next day →</Link>}</div></div>
      <div className="grid gap-4 sm:grid-cols-4"><Stat label="Present" value={c("present")} /><Stat label="Late" value={c("late")} /><Stat label="On leave" value={c("leave")} /><Stat label={d.date < d.today ? "Absent" : "Not in yet"} value={c("absent") + c("notyet")} /></div>

      <section aria-labelledby="ot-h">
        <h2 id="ot-h" className="mb-3 text-lg font-bold">Overtime awaiting approval ({d.pendingRows.length})</h2>
        {d.pendingRows.length === 0 ? <Empty title="No overtime waiting" hint="When an employee works past the end time in their contract, it shows here for approval. Approved overtime is paid in that month's payroll." /> : (
          <div className="card divide-y divide-slate-200">{d.pendingRows.map(({ r, c: k, first, last }) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div><div className="font-medium">{first} {last} · {r.workDate}</div><div className="text-slate-600">{fmtTime(r.clockIn, tz)}–{fmtTime(r.clockOut, tz)} · {fmtMinutes(r.overtimeMinutes)} after {k.workEnd} · worth about {ugx(overtimePayFor(r.overtimeMinutes, k.salary, k))}</div></div>
              <div className="flex gap-2"><ActionButton url={`/api/hr/attendance/${r.id}`} data={{ action: "approve" }} success="Overtime approved">Approve</ActionButton><ActionButton url={`/api/hr/attendance/${r.id}`} data={{ action: "reject" }} variant="secondary" confirm="Reject this overtime? It won't be paid.">Reject</ActionButton></div>
            </div>))}</div>)}
      </section>

      {d.emps.length === 0 ? <Empty title="No employees yet" /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><caption className="sr-only">Attendance on {d.date}</caption><thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Employee</th><th scope="col" className={th}>Contract hours</th><th scope="col" className={th}>Status</th><th scope="col" className={th}>In</th><th scope="col" className={th}>Out</th><th scope="col" className={th}>Late by</th><th scope="col" className={th}>Overtime</th><th scope="col" className="p-4 font-medium">Hours</th></tr></thead>
          <tbody className="divide-y divide-slate-200">{d.emps.map((e) => { const x = d.days.get(e.id)!; return <tr key={e.id}><td className="p-4"><Link href={`/hr/employees/${e.id}`} className="font-medium hover:text-accent-strong">{e.name}</Link></td><td className="text-slate-600">{e.workStart}–{e.workEnd}</td><td><DayBadge status={x.status} /></td><td>{fmtTime(x.clockIn, tz)}</td><td>{fmtTime(x.clockOut, tz)}</td><td>{x.lateMinutes > 0 ? `${x.lateMinutes} min` : "—"}</td><td><OvertimeCell minutes={x.overtimeMinutes} status={x.overtimeStatus} /></td><td className="p-4">{x.clockOut ? hoursBetween(x.clockIn, x.clockOut).toFixed(1) : "—"}</td></tr>; })}</tbody></table></div>)}
      {d.emps.length > 0 && (
        <section className="card p-6"><h3 className="mb-1 font-semibold">Record or correct attendance</h3><p className="mb-4 text-sm text-slate-600">Lateness and overtime are worked out from the employee's own contract hours. Overtime you enter is approved immediately.</p>
          <AjaxForm url="/api/hr/attendance" submit="Save" success="Attendance saved" reset className="grid items-end gap-3 sm:grid-cols-6">
            <div className="sm:col-span-2"><Field label="Employee"><select name="contractId" required defaultValue="" className="input"><option value="" disabled>Choose…</option>{d.emps.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.workStart}–{e.workEnd})</option>)}</select></Field></div>
            <Field label="Date"><input type="date" name="date" required defaultValue={d.date} max={d.today} className="input" /></Field><Field label="In"><input type="time" name="clockIn" required defaultValue="08:00" className="input" /></Field><Field label="Out"><input type="time" name="clockOut" className="input" /></Field><Field label="Note"><input name="note" className="input" /></Field>
          </AjaxForm></section>)}
    </div>
  );
}
