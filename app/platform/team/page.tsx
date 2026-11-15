import type { Metadata } from "next";
import { and, desc, eq, isNull } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, invitations } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/session";
import { Badge, Empty } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { InviteOneForm } from "@/components/platform-client-forms";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Consultants" };
export default async function Team() {
  await requirePlatformAdmin();
  const staff = await rootDb.select().from(users).where(eq(users.isConsultant, true)).orderBy(users.firstName);
  const pending = await rootDb.select().from(invitations).where(and(eq(invitations.kind, "staff"), isNull(invitations.acceptedAt), isNull(invitations.revokedAt))).orderBy(desc(invitations.createdAt));
  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-slate-600">Consultants are WorkConnect staff who deliver the service inside client workspaces: payroll, recruitment and HR support. They can open any active client's workspace; every entry is recorded, and clients can see which consultants have access.</p>
      <section className="card p-6"><h2 className="mb-3 font-semibold">Invite a consultant</h2><InviteOneForm url="/api/platform/staff" label="Consultant invitation link" cta="Send invitation" /></section>
      <section><h2 className="mb-3 text-lg font-bold">Consultants ({staff.length})</h2>
        {staff.length === 0 ? <Empty title="No consultants yet" /> : <div className="card divide-y divide-slate-200">{staff.map((u) => <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><div><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-500">{u.email}</div></div><div className="flex items-center gap-3">{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}<ActionButton url={`/api/platform/staff/${u.id}`} method="DELETE" variant="secondary" confirm={`Remove ${u.firstName}'s consultant access? They lose access to every client workspace.`} success="Consultant removed">Remove access</ActionButton></div></div>)}</div>}</section>
      {pending.length > 0 && <section><h2 className="mb-3 text-lg font-bold">Pending invitations</h2><div className="card divide-y divide-slate-200">{pending.map((i) => <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><span>{i.email} <span className="text-xs text-slate-500">· sent {timeAgo(i.createdAt)}</span></span><ActionButton url={`/api/platform/invitations/${i.id}`} method="DELETE" variant="ghost" confirm="Revoke this invitation?">Revoke</ActionButton></div>)}</div></section>}
    </div>
  );
}
