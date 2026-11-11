import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, and } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { supportTickets, users } from "@/db/schema";
import { Empty, StatusBadge, Badge, cn } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "HR support" };
const CATS = ["Payroll", "Leave", "Contract", "Attendance", "Policy question", "Other"];
const FILTERS = [["", "All"], ["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"]];

export default async function Support({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const s = await requireSession();
  const { status } = await searchParams;
  const st = ["open", "in_progress", "resolved"].includes(status ?? "") ? status! : "";
  const list = await tdb((tx) => tx.select({ t: supportTickets, first: users.firstName, last: users.lastName }).from(supportTickets).innerJoin(users, eq(users.id, supportTickets.requesterId))
    .where(and(s.role === "admin" ? undefined : eq(supportTickets.requesterId, s.userId), st ? eq(supportTickets.status, st) : undefined)).orderBy(desc(supportTickets.updatedAt)).limit(60));
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{s.role === "admin" ? "Helpdesk" : "My requests"}</h2>
          <div className="flex gap-1 rounded-xl border border-slate-200 p-1 text-sm">{FILTERS.map(([v, l]) => <Link key={v} href={v ? `/hr/support?status=${v}` : "/hr/support"} className={cn("rounded-lg px-3 py-1.5", st === v ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-800")}>{l}</Link>)}</div></div>
        {list.length === 0 ? <Empty title="No requests" hint="Ask HR about payroll, leave, your contract or anything else. We reply here and by email." /> : (
          <div className="card divide-y divide-slate-100">{list.map(({ t, first, last }) => (
            <Link key={t.id} href={`/hr/support/${t.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-100/40">
              <div className="min-w-0"><div className="truncate font-medium">{t.subject}</div><div className="text-xs text-slate-400">{s.role === "admin" ? `${first} ${last} · ` : ""}{t.category} · updated {timeAgo(t.updatedAt)}</div></div>
              <StatusBadge status={t.status} /></Link>))}</div>)}
      </section>
      <aside><div className="card p-6"><h2 className="mb-4 text-lg font-bold">New HR request</h2>
        <AjaxForm url="/api/hr/tickets" submit="Send request" redirect="/hr/support/:id">
          <Field label="Category"><select name="category" required defaultValue="" className="input"><option value="" disabled>Choose…</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Subject"><input name="subject" required className="input" /></Field>
          <Field label="Details"><textarea name="message" required rows={5} className="input" /></Field>
        </AjaxForm></div></aside>
    </div>
  );
}
void Badge;
