import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { eq } from "drizzle-orm";
import { rootDb, withTenant, type Tx } from "@/lib/db";
import { tenants } from "@/db/schema";
import { getSession, TENANT_COOKIE } from "@/lib/session";

export type Tenant = typeof tenants.$inferSelect;

/**
 * Which tenant is this visitor looking at?
 * signed in -> their active tenant; else custom domain -> ?t= cookie -> DEFAULT_TENANT_SLUG.
 */
export const currentTenant = cache(async (): Promise<Tenant | null> => {
  const s = await getSession();
  if (s) return (await rootDb.select().from(tenants).where(eq(tenants.id, s.tenantId)).limit(1))[0] ?? null;
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host) {
    const [byDomain] = await rootDb.select().from(tenants).where(eq(tenants.domain, host)).limit(1);
    if (byDomain) return byDomain;
  }
  const slug = (await cookies()).get(TENANT_COOKIE)?.value ?? process.env.DEFAULT_TENANT_SLUG;
  if (!slug) return (await rootDb.select().from(tenants).limit(1))[0] ?? null;
  return (await rootDb.select().from(tenants).where(eq(tenants.slug, slug)).limit(1))[0] ?? null;
});

/** Tenant-scoped DB access for server components (works signed out for public marketplace pages). */
export async function tdb<T>(fn: (tx: Tx, tenant: Tenant) => Promise<T>): Promise<T> {
  const t = await currentTenant();
  if (!t) throw new Error("No tenant configured. Run `npm run db:seed` or create a tenant.");
  const s = await getSession();
  return withTenant({ tenantId: t.id, userId: s?.userId }, (tx) => fn(tx, t));
}
