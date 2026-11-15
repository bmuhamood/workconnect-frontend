import type { Metadata } from "next";
import { count, desc, eq, and, isNull } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { memberships, users, workerProfiles, emailOutbox, invitations } from "@/db/schema";
import { PageHeader, Badge } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ActionButton } from "@/components/action-button";
import { TestEmailButton } from "@/components/test-email-button";
import { RetryEmailButton } from "@/components/retry-email-button";
import { InvitePeople } from "@/components/invite-people";
import { ROLE_LABEL } from "@/lib/invitations";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Team" };
export default async function Admin() {
  const s = await requireSession(["admin"]);
  const d = await tdb(async (tx, t) => ({
    t,
    members: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, email: users.email, role: memberships.role, consultant: memberships.isConsultant, verified: workerProfiles.verified }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).leftJoin(workerProfiles, eq(workerProfiles.userId, memberships.userId)).orderBy(desc(memberships.createdAt)),
    pending: await tx.select().from(invitations).where(and(isNull(invitations.acceptedAt), isNull(invitations.revokedAt), eq(invitations.kind, "member"))).orderBy(desc(invitations.createdAt)),
    mails: await tx.select().from(emailOutbox).orderBy(desc(emailOutbox.createdAt)).limit(25),
    failed: (await tx.select({ n: count() }).from(emailOutbox).where(eq(emailOutbox.status, "failed")))[0].n,
  }));
  const people = d.members.filter((m) => !m.consultant);
  const consultants = d.members.filter((m) => m.consultant);
  return (
    <div className="container-x py-10">
      <PageHeader title="Team" subtitle={`${d.t.name} · a private workspace, separate from every other client`} action={<a href="/hr/settings" className="rounded-xl border border-slate-300/60 bg-slate-100/60 px-4 py-2.5 text-sm font-medium hover:bg-slate-100">HR settings</a>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6"><h2 className="mb-1 font-semibold">Invite people</h2><p className="mb-4 text-sm text-slate-600">Invite your managers and employees. They receive a personal link to create their account.</p><InvitePeople /></section>
        <section className="card p-6"><h2 className="mb-4 font-semibold">Send an announcement</h2>
          <AjaxForm url="/api/admin/campaigns" submit="Send to your team" success="Announcement queued" reset>
            <Field label="Audience"><select name="audience" className="input"><option value="all">Everyone</option><option value="worker">Employees</option><option value="employer">Managers</option></select></Field>
            <Field label="Subject"><input name="subject" required className="input" /></Field>
            <Field label="Message"><textarea name="message" required rows={4} className="input" /></Field>
          </AjaxForm></section>
      </div>
      {d.pending.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-lg font-bold">Pending invitations ({d.pending.length})</h2>
          <div className="card divide-y divide-slate-100">{d.pending.map((i) => (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div><div className="font-medium">{i.email}</div><div className="text-xs text-slate-500">{ROLE_LABEL[i.role ?? ""] ?? i.role} · sent {timeAgo(i.createdAt)}{i.expiresAt < new Date() ? " · expired" : ""}</div></div>
              <div className="flex gap-2"><ActionButton url={`/api/admin/invitations/${i.id}`} method="POST" variant="secondary" success="Invitation re-sent">Resend</ActionButton><ActionButton url={`/api/admin/invitations/${i.id}`} method="DELETE" variant="ghost" confirm="Revoke this invitation?">Revoke</ActionButton></div>
            </div>))}</div>
        </>)}
      <h2 className="mb-3 mt-10 text-lg font-bold">People ({people.length})</h2>
      <div className="card overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><tbody className="divide-y divide-slate-100">{people.map((m) => (
        <tr key={m.id}><td className="p-4"><div className="font-medium">{m.first} {m.last}</div><div className="text-xs text-slate-500">{m.email}</div></td><td><Badge tone={m.role === "admin" ? "blue" : "gray"}>{ROLE_LABEL[m.role]}</Badge>{m.role === "worker" && m.verified ? <Badge tone="green" className="ml-1">Verified</Badge> : null}</td>
          <td className="p-4 text-right">{m.role === "worker" && <ActionButton url={`/api/admin/workers/${m.id}`} data={{ verified: !m.verified }} variant="secondary" success="Updated">{m.verified ? "Remove badge" : "Verify"}</ActionButton>}{m.id !== s.userId && <ActionButton url={`/api/admin/members/${m.id}`} method="DELETE" variant="ghost" confirm="Remove this person from your workspace?" className="ml-2">Remove</ActionButton>}</td></tr>))}</tbody></table></div>
      {consultants.length > 0 && (
        <section className="card mt-6 p-5"><h3 className="font-semibold">WorkConnect consultants with access</h3><p className="mt-1 text-sm text-slate-600">These WorkConnect staff are working in your workspace to deliver your service. They can't sign or end contracts or pay invoices for you. Each time one opens your workspace it is recorded.</p>
          <ul className="mt-3 space-y-1 text-sm">{consultants.map((c) => <li key={c.id}>{c.first} {c.last} <span className="text-slate-500">· {c.email}</span></li>)}</ul></section>)}
      <div className="mb-3 mt-10 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Recent emails</h2><TestEmailButton /></div>
      {d.failed > 0 && (
        <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-600/40 bg-rose-50 p-4 text-sm">
          <div><div className="font-semibold text-rose-700">{d.failed} email{d.failed === 1 ? "" : "s"} failed to send</div><div className="text-slate-600">Check the error shown on each one, fix the cause (for example the sender address or API key), then retry.</div></div>
          <RetryEmailButton label={`Retry all ${d.failed} failed`} variant="primary" />
        </div>
      )}
      <div className="card divide-y divide-slate-100">{d.mails.length === 0 && <p className="p-6 text-sm text-slate-400">No emails yet.</p>}{d.mails.map((m) => {
        const retryable = m.status === "failed" || (m.status === "queued" && m.attempts > 0);
        return (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div className="min-w-0 flex-1"><div className="truncate font-medium">{m.subject}</div><div className="text-xs text-slate-400">{m.toEmail} · {m.template} · {timeAgo(m.createdAt)}</div>{m.error && <div className="mt-1 text-xs text-rose-700">{m.error}</div>}</div>
            <div className="flex items-center gap-2">
              {m.status === "sent" ? <Badge tone="green">Sent</Badge> : m.status === "failed" ? <Badge tone="red">Failed after {m.attempts} tries</Badge> : <Badge tone="amber">{m.attempts > 0 ? `Retrying (${m.attempts}/5)` : "Queued"}</Badge>}
              {retryable && <RetryEmailButton id={m.id} />}
            </div>
          </div>
        );
      })}</div>
    </div>
  );
}
