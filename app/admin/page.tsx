import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { memberships, users, workerProfiles, emailOutbox, tenants } from "@/db/schema";
import { PageHeader, Badge, StatusBadge } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ActionButton } from "@/components/action-button";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };
export default async function Admin() {
  const s = await requireSession(["admin"]);
  const d = await tdb(async (tx) => ({
    t: (await tx.select().from(tenants))[0],
    members: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, email: users.email, role: memberships.role, verified: workerProfiles.verified }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).leftJoin(workerProfiles, eq(workerProfiles.userId, memberships.userId)).orderBy(desc(memberships.createdAt)),
    mails: await tx.select().from(emailOutbox).orderBy(desc(emailOutbox.createdAt)).limit(15),
  }));
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return (
    <div className="container-x py-10">
      <PageHeader title="Admin" subtitle={`${d.t.name} workspace · isolated from every other organisation`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6"><h2 className="mb-1 font-semibold">Organisation settings</h2><p className="mb-4 text-sm text-slate-500">Invite link: <code className="rounded bg-slate-100 px-1.5 py-0.5">{base}/t/{d.t.slug}</code></p>
          <AjaxForm url="/api/admin/tenant" method="PATCH" success="Settings saved">
            <Field label="Name"><input name="name" required defaultValue={d.t.name} className="input" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Brand colour"><input name="brandColor" type="color" defaultValue={d.t.brandColor} className="input !h-11 !p-1" /></Field><Field label="Service fee (%)"><input name="serviceFeePercent" type="number" step="0.5" min={0} max={50} defaultValue={d.t.serviceFeeBps / 100} className="input" /></Field></div>
            <Field label="Email sender name"><input name="emailFromName" defaultValue={d.t.emailFromName ?? ""} className="input" /></Field>
          </AjaxForm></div>
        <div className="card p-6"><h2 className="mb-4 font-semibold">Send a marketing email</h2>
          <AjaxForm url="/api/admin/campaigns" submit="Send to opted-in members" success="Campaign queued" reset>
            <Field label="Audience"><select name="audience" className="input"><option value="all">Everyone</option><option value="worker">Workers</option><option value="employer">Employers</option></select></Field>
            <Field label="Subject"><input name="subject" required className="input" /></Field>
            <Field label="Message"><textarea name="message" required rows={5} className="input" /></Field>
          </AjaxForm></div>
      </div>
      <h2 className="mb-3 mt-10 text-lg font-bold">Members ({d.members.length})</h2>
      <div className="card overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><tbody className="divide-y divide-slate-100">{d.members.map((m) => (
        <tr key={m.id}><td className="p-4"><div className="font-medium">{m.first} {m.last}</div><div className="text-xs text-slate-400">{m.email}</div></td><td><Badge tone={m.role === "admin" ? "blue" : "gray"}>{m.role}</Badge>{m.role === "worker" && (m.verified ? <Badge tone="green" className="ml-1">Verified</Badge> : null)}</td>
          <td className="p-4 text-right">{m.role === "worker" && <ActionButton url={`/api/admin/workers/${m.id}`} data={{ verified: !m.verified }} variant="secondary" success="Updated">{m.verified ? "Remove badge" : "Verify"}</ActionButton>}{m.id !== s.userId && <ActionButton url={`/api/admin/members/${m.id}`} method="DELETE" variant="ghost" confirm="Remove this member from your organisation?" className="ml-2">Remove</ActionButton>}</td></tr>))}</tbody></table></div>
      <h2 className="mb-3 mt-10 text-lg font-bold">Recent emails</h2>
      <div className="card divide-y divide-slate-100">{d.mails.length === 0 && <p className="p-6 text-sm text-slate-400">No emails yet.</p>}{d.mails.map((m) => <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm"><div className="min-w-0"><div className="truncate font-medium">{m.subject}</div><div className="text-xs text-slate-400">{m.toEmail} · {m.template} · {timeAgo(m.createdAt)}{m.error ? ` · ${m.error}` : ""}</div></div><StatusBadge status={m.status === "queued" ? "pending" : m.status === "sent" ? "completed" : "rejected"} /></div>)}</div>
    </div>
  );
}
