import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, memberships, tenants } from "@/db/schema";
import { getIdentity } from "@/lib/identity";

export type Role = "worker" | "employer" | "admin";
export type Session = {
  userId: string; tenantId: string; tenantName: string; tenantSlug: string; brandColor: string;
  role: Role; name: string; email: string; tenants: { id: string; name: string; role: Role }[];
};
export const TENANT_COOKIE = "wc_tenant";

/** Resolves identity -> app user -> active tenant membership. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const id = await getIdentity();
  if (!id) return null;
  const [u] = await rootDb.select().from(users).where(eq(users.authId, id.authId)).limit(1);
  if (!u || !u.isActive) return null;
  const rows = await rootDb.select({ m: memberships, t: tenants }).from(memberships)
    .innerJoin(tenants, eq(tenants.id, memberships.tenantId)).where(eq(memberships.userId, u.id));
  if (!rows.length) return null;
  const wanted = (await cookies()).get(TENANT_COOKIE)?.value;
  const cur = rows.find((r) => r.t.slug === wanted) ?? rows[0];
  return {
    userId: u.id, tenantId: cur.t.id, tenantName: cur.t.name, tenantSlug: cur.t.slug, brandColor: cur.t.brandColor,
    role: cur.m.role, name: `${u.firstName} ${u.lastName}`.trim(), email: u.email,
    tenants: rows.map((r) => ({ id: r.t.id, name: r.t.name, role: r.m.role })),
  };
});

export async function requireSession(roles?: Role[]): Promise<Session> {
  const s = await getSession();
  if (!s) redirect((await getIdentity()) ? "/register?finish=1" : "/login");
  if (roles && !roles.includes(s.role)) redirect("/dashboard");
  return s;
}
