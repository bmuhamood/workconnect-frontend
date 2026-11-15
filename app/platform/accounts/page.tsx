import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, memberships, tenants } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/session";
import { Badge, Avatar } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { ROLE_LABEL } from "@/lib/invitations";

export const metadata: Metadata = { title: "Accounts" };
export default async function Accounts() {
  const admin = await requirePlatformAdmin();
  const people = await rootDb.select({ u: users, org: tenants.name, role: memberships.role, consultant: memberships.isConsultant }).from(users).leftJoin(memberships, eq(memberships.userId, users.id)).leftJoin(tenants, eq(tenants.id, memberships.tenantId)).orderBy(desc(users.createdAt)).limit(100);
  return (
    <div><h2 className="mb-1 text-lg font-bold">All accounts</h2><p className="mb-4 text-sm text-slate-600">Deactivating an account stops it signing in. Showing the 100 most recent.</p>
      <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><caption className="sr-only">Every account on the platform</caption>
        <thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">Person</th><th scope="col" className="font-medium">Role</th><th scope="col" className="font-medium">Client</th><th scope="col" className="font-medium">Status</th><th scope="col" className="p-4" /></tr></thead>
        <tbody className="divide-y divide-slate-200">{people.map(({ u, org, role, consultant }) => (
          <tr key={u.id + (org ?? "")}><td className="p-4"><div className="flex items-center gap-3"><Avatar name={`${u.firstName} ${u.lastName}`} size={32} /><div><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-xs text-slate-500">{u.email}</div></div></div></td>
            <td>{u.isSuperAdmin ? <Badge tone="blue">Super admin</Badge> : consultant || u.isConsultant ? <Badge tone="amber">WorkConnect consultant</Badge> : role ? ROLE_LABEL[role] : "—"}</td><td>{org ?? "—"}</td>
            <td>{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td>
            <td className="p-4 text-right">{u.isSuperAdmin || u.id === admin.userId ? null : u.isActive ? <ActionButton url={`/api/platform/users/${u.id}`} data={{ action: "deactivate" }} variant="ghost" confirm={`Deactivate ${u.firstName} ${u.lastName}?`}>Deactivate</ActionButton> : <ActionButton url={`/api/platform/users/${u.id}`} data={{ action: "activate" }} variant="ghost">Reactivate</ActionButton>}</td></tr>))}</tbody></table></div>
    </div>
  );
}
