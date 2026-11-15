import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, memberships, tenants } from "@/db/schema";
import { getIdentity } from "@/lib/identity";

/** Roles inside ONE client organisation: admin = the client's administrator, employer = a manager, worker = an employee. */
export type Role = "worker" | "employer" | "admin";
export type Session = {
  userId: string; tenantId: string; tenantName: string; tenantSlug: string; brandColor: string;
  role: Role; name: string; email: string; tenants: { id: string; name: string; role: Role }[];
  /** WorkConnect staff working inside this client's workspace. */
  consultant: boolean;
};
export const TENANT_COOKIE = "wc_tenant";

const userByIdentity = cache(async () => {
  const id = await getIdentity();
  if (!id) return null;
  const [u] = await rootDb.select().from(users).where(eq(users.authId, id.authId)).limit(1);
  return u && u.isActive ? u : null;
});

/** Resolves identity -> app user -> the client workspace they are in. Cached per request. */
export const getSession = cache(async (): Promise<Session | null> => {
  const u = await userByIdentity();
  if (!u) return null;
  const rows = await rootDb.select({ m: memberships, t: tenants }).from(memberships)
    .innerJoin(tenants, eq(tenants.id, memberships.tenantId)).where(and(eq(memberships.userId, u.id), isNull(tenants.suspendedAt)));
  if (!rows.length) return null;
  const wanted = (await cookies()).get(TENANT_COOKIE)?.value;
  const staff = u.isSuperAdmin || u.isConsultant;
  // WorkConnect staff only enter a client workspace deliberately (via the platform console), never by default.
  const cur = rows.find((r) => r.t.slug === wanted) ?? (staff ? undefined : rows[0]);
  if (!cur) return null;
  return {
    userId: u.id, tenantId: cur.t.id, tenantName: cur.t.name, tenantSlug: cur.t.slug, brandColor: cur.t.brandColor,
    role: cur.m.role, name: `${u.firstName} ${u.lastName}`.trim(), email: u.email, consultant: cur.m.isConsultant,
    tenants: rows.map((r) => ({ id: r.t.id, name: r.t.name, role: r.m.role })),
  };
});

export type Staff = { userId: string; name: string; email: string; superAdmin: boolean };
/** WorkConnect staff: the Super Admin (platform owner) or a consultant. Not tied to any client. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const u = await userByIdentity();
  if (!u || !(u.isSuperAdmin || u.isConsultant)) return null;
  return { userId: u.id, name: `${u.firstName} ${u.lastName}`.trim(), email: u.email, superAdmin: u.isSuperAdmin };
});
export type PlatformAdmin = Staff;
/** Only the Super WorkConnect Admin. */
export const getPlatformAdmin = cache(async (): Promise<Staff | null> => { const s = await getStaff(); return s?.superAdmin ? s : null; });
export async function requirePlatformAdmin(): Promise<Staff> {
  const a = await getPlatformAdmin();
  if (!a) redirect((await getIdentity()) ? ((await getStaff()) ? "/platform" : "/dashboard") : "/login");
  return a;
}
export async function requireStaff(): Promise<Staff> {
  const a = await getStaff();
  if (!a) redirect((await getIdentity()) ? "/dashboard" : "/login");
  return a;
}

export async function requireSession(roles?: Role[]): Promise<Session> {
  const s = await getSession();
  if (!s) {
    const id = await getIdentity();
    if (!id) redirect("/login");
    if (await getStaff()) redirect("/platform");
    // Signed in, but every client workspace they belong to is suspended?
    const u = await userByIdentity();
    if (u) {
      const sus = await rootDb.select({ id: memberships.id }).from(memberships).innerJoin(tenants, eq(tenants.id, memberships.tenantId)).where(and(eq(memberships.userId, u.id), isNotNull(tenants.suspendedAt))).limit(1);
      if (sus.length) redirect("/login?suspended=1");
    }
    redirect("/register");
  }
  if (roles && !roles.includes(s.role)) redirect("/dashboard");
  return s;
}
