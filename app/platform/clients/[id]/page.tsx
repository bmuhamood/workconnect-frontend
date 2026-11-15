import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { tenants, memberships, users, invitations, contracts, auditLog } from "@/db/schema";
import { requireStaff } from "@/lib/session";
import { Badge, Stat } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { ClientSettingsForm, EnterWorkspaceButton, InviteOneForm } from "@/components/platform-client-forms";
import { ROLE_LABEL } from "@/lib/invitations";
import { timeAgo } from "@/lib/format";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireStaff();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [t] = await rootDb.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!t) notFound();
  const people = await rootDb.select({ u: users, m: memberships }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.tenantId, id)).orderBy(memberships.role);
  const pending = await rootDb.select().from(invitations).where(and(eq(invitations.tenantId, id), isNull(invitations.acceptedAt), isNull(invitations.revokedAt))).orderBy(desc(invitations.createdAt));
  const [live] = await rootDb.select({ n: sql<number>`count(*)::int` }).from(contracts).where(and(eq(contracts.tenantId, id), eq(contracts.status, "active")));
  const log = await rootDb.select().from(auditLog).where(eq(auditLog.tenantId, id)).orderBy(desc(auditLog.createdAt)).limit(8);
  const members = people.filter((p) => !p.m.isConsultant);
  const n = (r: string) => members.filter((p) => p.m.role === r).length;
  return (
    <div className="space-y-8">
      <div><Link href="/platform" className="text-sm text-slate-600 hover:text-slate-900">← All clients</Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold">{t.name}</h2><p className="text-sm text-slate-500">{t.industry ?? "No industry set"} · client since {t.createdAt.toISOString().slice(0, 10)}</p></div>
          <div className="flex flex-wrap items-center gap-2">{t.suspendedAt ? <Badge tone="red">Suspended</Badge> : <><Badge tone="green">Active</Badge><EnterWorkspaceButton id={t.id} /></>}
            {staff.superAdmin && (t.suspendedAt ? <ActionButton url={`/api/platform/tenants/${t.id}`} data={{ action: "activate" }} variant="secondary" success="Client reactivated">Reactivate</ActionButton> : <ActionButton url={`/api/platform/tenants/${t.id}`} data={{ action: "suspend" }} variant="secondary" confirm={`Suspend ${t.name}? None of its people can sign in until you reactivate it. Its data is kept.`} success="Client suspended">Suspend</ActionButton>)}</div></div></div>
      <div className="grid gap-4 sm:grid-cols-4"><Stat label="Administrators" value={n("admin")} /><Stat label="Managers" value={n("employer")} /><Stat label="Employees" value={n("worker")} /><Stat label="Active contracts" value={live.n} /></div>
      <p className="text-sm text-slate-600">This page shows counts and account details only. Opening the workspace gives you access to the client's data and is recorded in the audit log.</p>
      {staff.superAdmin && <section className="card p-6"><h3 className="mb-4 font-semibold">Client details</h3><ClientSettingsForm id={t.id} name={t.name} industry={t.industry ?? ""} feePercent={t.serviceFeeBps / 100} /></section>}
      <section><h3 className="mb-3 text-lg font-bold">People</h3>
        <div className="card overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><tbody className="divide-y divide-slate-200">{people.map(({ u, m }) => <tr key={m.id}><td className="p-4"><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-500">{u.email}</div></td><td>{m.isConsultant ? <Badge tone="amber">WorkConnect consultant</Badge> : <Badge tone={m.role === "admin" ? "blue" : "gray"}>{ROLE_LABEL[m.role]}</Badge>}</td><td>{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td></tr>)}</tbody></table></div></section>
      <section><h3 className="mb-3 text-lg font-bold">Invitations ({pending.length} pending)</h3>
        {pending.length > 0 && <div className="card mb-4 divide-y divide-slate-200">{pending.map((i) => <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><div><div className="font-medium">{i.email}</div><div className="text-xs text-slate-500">{ROLE_LABEL[i.role ?? ""] ?? i.role} · sent {timeAgo(i.createdAt)}{i.expiresAt < new Date() ? " · expired" : ""}</div></div>{staff.superAdmin && <ActionButton url={`/api/platform/invitations/${i.id}`} method="DELETE" variant="ghost" confirm="Revoke this invitation?">Revoke</ActionButton>}</div>)}</div>}
        {staff.superAdmin && <div className="card p-6"><h4 className="mb-3 font-semibold">Invite another administrator for {t.name}</h4><InviteOneForm url={`/api/platform/tenants/${t.id}/invite`} label="Invitation link" cta="Send invitation" /></div>}</section>
      <section><h3 className="mb-3 text-lg font-bold">Recent activity by WorkConnect</h3>{log.length === 0 ? <p className="text-sm text-slate-500">Nothing recorded yet.</p> : <ul className="card divide-y divide-slate-200 text-sm">{log.map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-2 p-4"><span><b>{l.actorName}</b> · {l.action.replace(/_/g, " ")}{l.detail ? ` · ${l.detail}` : ""}</span><span className="text-xs text-slate-500">{timeAgo(l.createdAt)}</span></li>)}</ul>}</section>
    </div>
  );
}
