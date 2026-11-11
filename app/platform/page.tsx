import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Building2, Users, FileText, Wallet, Plus } from "lucide-react";
import { rootDb } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/session";
import { tenants, memberships, users, contracts, invoices } from "@/db/schema";
import { PageHeader, Stat, LinkButton, Badge, Empty, Avatar } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Platform console" };
export default async function Platform() {
  const admin = await requirePlatformAdmin();
  const orgs = await rootDb.select().from(tenants).orderBy(desc(tenants.createdAt));
  const mem = await rootDb.select({ tenantId: memberships.tenantId, role: memberships.role, n: sql<number>`count(*)::int` }).from(memberships).groupBy(memberships.tenantId, memberships.role);
  const act = await rootDb.select({ tenantId: contracts.tenantId, n: sql<number>`count(*)::int` }).from(contracts).where(eq(contracts.status, "active")).groupBy(contracts.tenantId);
  const fees = await rootDb.select({ tenantId: invoices.tenantId, t: sql<number>`coalesce(sum(${invoices.feeAmount}),0)::int` }).from(invoices).where(eq(invoices.status, "paid")).groupBy(invoices.tenantId);
  const owners = await rootDb.select({ tenantId: memberships.tenantId, first: users.firstName, last: users.lastName, email: users.email }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.role, "admin"));
  const people = await rootDb.select({ u: users, org: tenants.name, role: memberships.role }).from(users).leftJoin(memberships, eq(memberships.userId, users.id)).leftJoin(tenants, eq(tenants.id, memberships.tenantId)).orderBy(desc(users.createdAt)).limit(60);
  const n = (tid: string, role: string) => mem.find((m) => m.tenantId === tid && m.role === role)?.n ?? 0;
  const totals = { orgs: orgs.length, clients: mem.filter((m) => m.role === "employer").reduce((a, m) => a + m.n, 0), staff: mem.filter((m) => m.role === "worker").reduce((a, m) => a + m.n, 0), active: act.reduce((a, m) => a + m.n, 0), fees: fees.reduce((a, m) => a + m.t, 0) };
  return (
    <div className="container-x py-10">
      <PageHeader title="Platform console" subtitle={`Signed in as ${admin.name} · Super WorkConnect Admin`} action={<LinkButton href="/platform/new"><Plus className="size-4" />Add HR consultancy</LinkButton>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="HR consultancies" value={totals.orgs} icon={<Building2 className="size-4" />} />
        <Stat label="Client companies" value={totals.clients} icon={<Users className="size-4" />} />
        <Stat label="Employees · active contracts" value={`${totals.staff} · ${totals.active}`} icon={<FileText className="size-4" />} />
        <Stat label="Service fees collected" value={ugx(totals.fees)} icon={<Wallet className="size-4" />} />
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold">HR consultancies</h2>
      {orgs.length === 0 ? <Empty title="No organisations yet" action={<LinkButton href="/platform/new">Add the first one</LinkButton>} /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><caption className="sr-only">All HR consultancies on the platform</caption>
          <thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Organisation</th><th scope="col" className="font-medium">Owner</th><th scope="col" className="font-medium">Clients</th><th scope="col" className="font-medium">Employees</th><th scope="col" className="font-medium">Active contracts</th><th scope="col" className="font-medium">Fees</th><th scope="col" className="font-medium">Status</th><th scope="col" className="p-4" /></tr></thead>
          <tbody className="divide-y divide-slate-200">{orgs.map((o) => { const ow = owners.filter((x) => x.tenantId === o.id); return (
            <tr key={o.id}><td className="p-4"><div className="font-medium">{o.name}</div><div className="text-xs text-slate-500">/{o.slug} · since {o.createdAt.toISOString().slice(0, 10)}</div></td>
              <td>{ow.length ? ow.map((x) => <div key={x.email}>{x.first} {x.last}<div className="text-xs text-slate-500">{x.email}</div></div>) : "—"}</td>
              <td>{n(o.id, "employer")}</td><td>{n(o.id, "worker")}</td><td>{act.find((a) => a.tenantId === o.id)?.n ?? 0}</td><td>{ugx(fees.find((f) => f.tenantId === o.id)?.t ?? 0)}</td>
              <td>{o.suspendedAt ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}</td>
              <td className="p-4 text-right">{o.suspendedAt
                ? <ActionButton url={`/api/platform/tenants/${o.id}`} data={{ action: "activate" }} variant="secondary" success="Organisation reactivated">Reactivate</ActionButton>
                : <ActionButton url={`/api/platform/tenants/${o.id}`} data={{ action: "suspend" }} variant="secondary" confirm={`Suspend ${o.name}? None of its users will be able to sign in until you reactivate it.`} success="Organisation suspended">Suspend</ActionButton>}</td></tr>); })}</tbody></table></div>)}

      <h2 className="mb-3 mt-10 text-lg font-bold">All accounts</h2>
      <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><caption className="sr-only">Every account on the platform</caption>
        <thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Person</th><th scope="col" className="font-medium">Role</th><th scope="col" className="font-medium">Organisation</th><th scope="col" className="font-medium">Status</th><th scope="col" className="p-4" /></tr></thead>
        <tbody className="divide-y divide-slate-200">{people.map(({ u, org, role }) => (
          <tr key={u.id + (org ?? "")}><td className="p-4"><div className="flex items-center gap-3"><Avatar name={`${u.firstName} ${u.lastName}`} size={32} /><div><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-500">{u.email}</div></div></div></td>
            <td>{u.isSuperAdmin ? <Badge tone="blue">Super admin</Badge> : <span className="capitalize">{role === "admin" ? "HR consultancy owner / admin" : role === "employer" ? "Client" : role === "worker" ? "Employee" : "—"}</span>}</td><td>{org ?? "—"}</td>
            <td>{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td>
            <td className="p-4 text-right">{u.isSuperAdmin || u.id === admin.userId ? null : u.isActive
              ? <ActionButton url={`/api/platform/users/${u.id}`} data={{ action: "deactivate" }} variant="ghost" confirm={`Deactivate ${u.firstName} ${u.lastName}?`}>Deactivate</ActionButton>
              : <ActionButton url={`/api/platform/users/${u.id}`} data={{ action: "activate" }} variant="ghost">Reactivate</ActionButton>}</td></tr>))}</tbody></table></div>
      <p className="mt-3 text-xs text-slate-500">Showing the 60 most recent accounts. <Link href="/api/health" className="underline">System health</Link></p>
    </div>
  );
}
