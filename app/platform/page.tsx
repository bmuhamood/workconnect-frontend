import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { Building2, Users, FileText, Wallet, Plus } from "lucide-react";
import { rootDb } from "@/lib/db";
import { tenants, memberships, contracts, invoices } from "@/db/schema";
import { requireStaff } from "@/lib/session";
import { Stat, LinkButton, Badge, Empty } from "@/components/ui";
import { EnterWorkspaceButton } from "@/components/platform-client-forms";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Clients" };
export default async function Platform() {
  const staff = await requireStaff();
  const orgs = await rootDb.select().from(tenants).orderBy(desc(tenants.createdAt));
  const mem = await rootDb.select({ tenantId: memberships.tenantId, role: memberships.role, n: sql<number>`count(*) filter (where not ${memberships.isConsultant})::int` }).from(memberships).groupBy(memberships.tenantId, memberships.role);
  const act = await rootDb.select({ tenantId: contracts.tenantId, n: sql<number>`count(*)::int` }).from(contracts).where(eq(contracts.status, "active")).groupBy(contracts.tenantId);
  const fees = await rootDb.select({ t: sql<number>`coalesce(sum(${invoices.feeAmount}),0)::int` }).from(invoices).where(eq(invoices.status, "paid"));
  const count = (id: string, role: string) => mem.find((m) => m.tenantId === id && m.role === role)?.n ?? 0;
  const live = orgs.filter((o) => !o.suspendedAt).length;
  const employees = act.reduce((n, a) => n + a.n, 0);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active clients" value={live} icon={<Building2 className="size-4" aria-hidden="true" />} />
        <Stat label="Suspended" value={orgs.length - live} icon={<Building2 className="size-4" aria-hidden="true" />} />
        <Stat label="Employees under management" value={employees} icon={<Users className="size-4" aria-hidden="true" />} />
        {staff.superAdmin ? <Stat label="Service fees collected" value={ugx(fees[0]?.t ?? 0)} icon={<Wallet className="size-4" aria-hidden="true" />} /> : <Stat label="Active contracts" value={employees} icon={<FileText className="size-4" aria-hidden="true" />} />}
      </div>
      <div className="mb-3 mt-10 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Client organisations ({orgs.length})</h2>{staff.superAdmin && <LinkButton href="/platform/new"><Plus className="size-4" aria-hidden="true" />Add a client</LinkButton>}</div>
      {orgs.length === 0 ? <Empty title="No clients yet" hint="Add your first client organisation and invite its administrator." action={staff.superAdmin ? <LinkButton href="/platform/new">Add a client</LinkButton> : undefined} /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><caption className="sr-only">Client organisations</caption>
          <thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Client</th><th scope="col" className="font-medium">Administrators</th><th scope="col" className="font-medium">Managers</th><th scope="col" className="font-medium">Employees</th><th scope="col" className="font-medium">Active contracts</th><th scope="col" className="font-medium">Status</th><th scope="col" className="p-4" /></tr></thead>
          <tbody className="divide-y divide-slate-200">{orgs.map((o) => (
            <tr key={o.id}><td className="p-4"><Link href={`/platform/clients/${o.id}`} className="font-semibold hover:text-accent-strong">{o.name}</Link><div className="text-xs text-slate-500">{o.industry ?? "—"}</div></td>
              <td>{count(o.id, "admin")}</td><td>{count(o.id, "employer")}</td><td>{count(o.id, "worker")}</td><td>{act.find((a) => a.tenantId === o.id)?.n ?? 0}</td>
              <td>{o.suspendedAt ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}</td>
              <td className="p-4 text-right">{!o.suspendedAt && <EnterWorkspaceButton id={o.id} />}</td></tr>))}</tbody></table></div>)}
    </div>
  );
}
