import { notFound } from "next/navigation";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { supportTickets, ticketMessages, users } from "@/db/schema";
import { Avatar, StatusBadge, cn } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ActionButton } from "@/components/action-button";
import { timeAgo } from "@/lib/format";

export default async function Ticket({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireSession();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await tdb(async (tx) => {
    const [t] = await tx.select({ t: supportTickets, first: users.firstName, last: users.lastName }).from(supportTickets).innerJoin(users, eq(users.id, supportTickets.requesterId)).where(eq(supportTickets.id, id)).limit(1);
    if (!t || (s.role !== "admin" && t.t.requesterId !== s.userId)) return null;
    const msgs = await tx.select({ m: ticketMessages, first: users.firstName, last: users.lastName }).from(ticketMessages).innerJoin(users, eq(users.id, ticketMessages.authorId)).where(eq(ticketMessages.ticketId, id)).orderBy(asc(ticketMessages.createdAt));
    return { ...t, msgs };
  });
  if (!d) notFound();
  const { t, msgs } = d;
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/hr/support" className="text-sm text-slate-500 hover:text-slate-800">← All requests</Link>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-bold">{t.subject}</h2><p className="mt-1 text-sm text-slate-500">{t.category} · from {d.first} {d.last} · opened {timeAgo(t.createdAt)}</p></div><StatusBadge status={t.status} /></div>
      {s.role === "admin" && <div className="flex flex-wrap gap-2">{(["open", "in_progress", "resolved"] as const).filter((x) => x !== t.status).map((x) => <ActionButton key={x} url={`/api/hr/tickets/${t.id}`} data={{ status: x }} variant="secondary" success="Status updated">{x === "resolved" ? "Mark resolved" : x === "in_progress" ? "Mark in progress" : "Reopen"}</ActionButton>)}</div>}
      <div className="space-y-3">{msgs.map(({ m, first, last }) => { const staff = m.authorId !== t.requesterId; return (
        <div key={m.id} className={cn("flex gap-3", staff && "flex-row-reverse")}><Avatar name={`${first} ${last}`} size={34} />
          <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", staff ? "bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand" : "border border-slate-200 bg-white")}><div className={cn("mb-1 text-xs", staff ? "text-onbrand" : "text-slate-400")}>{first} {last} · {timeAgo(m.createdAt)}</div><p className="whitespace-pre-line">{m.body}</p></div></div>); })}</div>
      {!(t.status === "resolved" && s.role === "admin") && <div className="card p-5"><AjaxForm url={`/api/hr/tickets/${t.id}`} submit="Send reply" reset success="Reply sent"><Field label={t.status === "resolved" ? "Reply (reopens this request)" : "Reply"}><textarea name="message" required rows={3} className="input" /></Field></AjaxForm></div>}
    </div>
  );
}
