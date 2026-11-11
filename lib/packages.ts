import "server-only";
import { asc, eq } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { servicePackages } from "@/db/schema";
import { DEFAULT_PACKAGES } from "@/lib/domain-constants";

export type PublicPackage = { id: string; name: string; tagline: string; priceText: string; billingNote: string; features: string[]; highlighted: boolean };
/** Active packages for the tenant, or the starter set (display only) when the admin hasn't created any. */
export async function getPackages(tx: Tx): Promise<PublicPackage[]> {
  const rows = await tx.select().from(servicePackages).where(eq(servicePackages.active, true)).orderBy(asc(servicePackages.sortOrder), asc(servicePackages.createdAt));
  if (rows.length) return rows;
  return DEFAULT_PACKAGES.map((p, i) => ({ id: `starter-${i}`, name: p.name, tagline: p.tagline, priceText: p.priceText, billingNote: p.billingNote, features: [...p.features], highlighted: p.highlighted }));
}
