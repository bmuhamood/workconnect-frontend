import type { Metadata } from "next";
import Link from "next/link";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { Empty, Stat } from "@/components/ui";
import { DayBadge } from "@/components/day-badge";
import { ClockWidget } from "@/components/clock-widget";
import { AjaxForm, Field } from "@/components/ajax-form";
import { activeEmployees, dayStatus, rangeStatus, fmtTime } from "@/lib/hr";
import { isRealDate, localParts, hoursBetween } from "@/lib/hr-calc";

export const metadata: Metadata = { title: "Attendance" };
const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);

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
      return { kind: "worker" as const, t, today, me, rows };
    }
    return { kind: "manager" as const, t, today, date, emps, days: await dayStatus(tx, t, date, emps.map((e) => ({ id: e.id, workerId: e.workerId }))) };
  });
  const tz = d.t.timezone;
  if (d.kind === "worker") {
    const today = d.rows.find((r) => r.ymd === d.today);
    return (
      <div className="space-y-6">
        {d.me ? <ClockWidget state={today?.status === "leave" ? "leave" : today?.clockOut ? "done" : today?.clockIn ? "in" : "out"} since={fmtTime(today?.clockIn ?? null, tz)} /> : <Empty title="No active contract" hint="You can clock in once you have a signed, active contract." />}
        <p className="text-sm text-slate-500">Work starts at {d.t.workStart}. Clocking in more than {d.t.lateGraceMinutes} minutes later is recorded as late. Times are in {tz}.</p>
        {d.rows.length > 0 && <div className="card overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Date</th><th className="font-medium">Status</th><th className="font-medium">In</th><th className="font-medium">Out</th><th className="p-4 font-medium">Hours</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{d.rows.map((r) => <tr key={r.ymd}><td className="p-4">{r.ymd}</td><td><DayBadge status={r.status} /></td><td>{fmtTime(r.clockIn, tz)}</td><td>{fmtTime(r.clockOut, tz)}</td><td className="p-4">{r.clockOut ? hoursBetween(r.clockIn, r.clockOut).toFixed(1) : "—"}</td></tr>)}</tbody></table></div>}
      </div>
    );
  }
  const vals = [...d.days.values()];
  const c = (k: string) => vals.filter((v) => v.status === k).length;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{d.date === d.today ? "Today" : d.date}</h2>
        <div className="flex gap-2 text-sm"><Link className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100" href={`/hr/attendance?date=${addDays(d.date, -1)}`}>← Previous day</Link>{d.date < d.today && <Link className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-100" href={`/hr/attendance?date=${addDays(d.date, 1)}`}>Next day →</Link>}</div></div>
      <div className="grid gap-4 sm:grid-cols-4"><Stat label="Present" value={c("present")} /><Stat label="Late" value={c("late")} /><Stat label="On leave" value={c("leave")} /><Stat label={d.date < d.today ? "Absent" : "Not in yet"} value={c("absent") + c("notyet")} /></div>
      {d.emps.length === 0 ? <Empty title="No employees yet" /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Employee</th><th className="font-medium">Status</th><th className="font-medium">In</th><th className="font-medium">Out</th><th className="p-4 font-medium">Hours</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{d.emps.map((e) => { const x = d.days.get(e.id)!; return <tr key={e.id}><td className="p-4"><Link href={`/hr/employees/${e.id}`} className="font-medium hover:text-accent-strong">{e.name}</Link></td><td><DayBadge status={x.status} /></td><td>{fmtTime(x.clockIn, tz)}</td><td>{fmtTime(x.clockOut, tz)}</td><td className="p-4">{x.clockOut ? hoursBetween(x.clockIn, x.clockOut).toFixed(1) : "—"}</td></tr>; })}</tbody></table></div>)}
      {d.emps.length > 0 && (
        <section className="card p-6"><h3 className="mb-4 font-semibold">Record or correct attendance</h3>
          <AjaxForm url="/api/hr/attendance" submit="Save" success="Attendance saved" reset className="grid items-end gap-3 sm:grid-cols-6">
            <div className="sm:col-span-2"><Field label="Employee"><select name="contractId" required defaultValue="" className="input"><option value="" disabled>Choose…</option>{d.emps.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field></div>
            <Field label="Date"><input type="date" name="date" required defaultValue={d.date} max={d.today} className="input" /></Field><Field label="In"><input type="time" name="clockIn" required defaultValue="08:00" className="input" /></Field><Field label="Out"><input type="time" name="clockOut" className="input" /></Field><Field label="Note"><input name="note" className="input" /></Field>
          </AjaxForm></section>)}
    </div>
  );
}
