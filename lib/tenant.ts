import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { rootDb, withTenant, type Tx } from "@/lib/db";
import { tenants } from "@/db/schema";
import { getSession } from "@/lib/session";

export type Tenant = typeof tenants.$inferSelect;

/** The client workspace the signed-in user is in. There is no "default" or public tenant: the public site belongs to WorkConnect. */
export const currentTenant = cache(async (): Promise<Tenant | null> => {
  try {
    const s = await getSession();
    return s ? (await rootDb.select().from(tenants).where(eq(tenants.id, s.tenantId)).limit(1))[0] ?? null : null;
  } catch (e) {
    console.error("[tenant] could not resolve tenant (is the database migrated? see /api/health):", (e as Error).message.slice(0, 160));
    return null;
  }
});

/** Tenant-scoped DB access for server components. Requires a signed-in user in a client workspace. */
export async function tdb<T>(fn: (tx: Tx, tenant: Tenant) => Promise<T>): Promise<T> {
  const t = await currentTenant();
  const s = await getSession();
  if (!t || !s) throw new Error("Not signed in to a client workspace.");
  return withTenant({ tenantId: t.id, userId: s.userId }, (tx) => fn(tx, t));
}
