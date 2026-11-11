import Link from "next/link";
import type { Metadata } from "next";
import { inArray } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { users } from "@/db/schema";
import { Empty, Avatar } from "@/components/ui";
import { DayBadge } from "@/components/day-badge";
import { activeEmployees, dayStatus, leaveBalances } from "@/lib/hr";
import { localParts } from "@/lib/hr-calc";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Employees" };
export default async function Employees() {
  const s = await requireSession(["admin", "employer"]);
  const d = await tdb(async (tx, t) => {
    const today = localParts(new Date(), t.timezone).ymd;
    const emps = await activeEmployees(tx, s);
    const days = await dayStatus(tx, t, today, emps.map((e) => ({ id: e.id, workerId: e.workerId })));
    const names = emps.length ? await tx.select({ id: users.id, first: users.firstName, last: users.lastName }).from(users).where(inArray(users.id, [...new Set(emps.map((e) => e.employerId))])) : [];
    const bal = new Map(await Promise.all(emps.map(async (e) => [e.id, (await leaveBalances(tx, t, e.workerId, Number(today.slice(0, 4)))).find((b) => b.type === "annual")] as const)));
    return { emps, days, names, bal };
  });
  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between"><h2 className="text-lg font-bold">Employees ({d.emps.length})</h2><span className="text-sm text-slate-500">People on an active contract</span></div>
      {d.emps.length === 0 ? <Empty title="No employees yet" hint="An employee appears here once a contract is signed by both sides." /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Employee</th><th className="font-medium">Role</th>{s.role === "admin" && <th className="font-medium">Client</th>}<th className="font-medium">Started</th><th className="font-medium">Today</th><th className="font-medium">Annual leave left</th><th className="p-4 text-right font-medium">Salary</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{d.emps.map((e) => {
            const emp = d.names.find((n) => n.id === e.employerId); const b = d.bal.get(e.id);
            return <tr key={e.id} className="hover:bg-slate-100/30">
              <td className="p-4"><Link href={`/hr/employees/${e.id}`} className="flex items-center gap-3 font-medium hover:text-accent-strong"><Avatar name={e.name} size={34} />{e.name}</Link></td>
              <td>{e.title}</td>{s.role === "admin" && <td className="text-slate-500">{emp ? `${emp.first} ${emp.last}` : "—"}</td>}
              <td className="text-slate-500">{e.startDate}</td><td><DayBadge status={d.days.get(e.id)?.status ?? "notyet"} /></td>
              <td>{b ? `${b.left} / ${b.entitled} days` : "—"}</td><td className="p-4 text-right">{ugx(e.salary)}</td></tr>;
          })}</tbody></table></div>)}
    </div>
  );
}
