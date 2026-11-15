import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformPackages, tenants, contracts, users } from "@/db/schema";
import { DEFAULT_PACKAGES } from "@/lib/domain-constants";

export type PublicPackage = { id: string; name: string; tagline: string; priceText: string; billingNote: string; features: string[]; highlighted: boolean };
/** WorkConnect's own packages, or the editable starter set (display only) until the Super Admin saves some. */
export async function getPlatformPackages(): Promise<PublicPackage[]> {
  const rows = await rootDb.select().from(platformPackages).where(eq(platformPackages.active, true)).orderBy(asc(platformPackages.sortOrder), asc(platformPackages.createdAt));
  if (rows.length) return rows;
  return DEFAULT_PACKAGES.map((p, i) => ({ id: `starter-${i}`, name: p.name, tagline: p.tagline, priceText: p.priceText, billingNote: p.billingNote, features: [...p.features], highlighted: p.highlighted }));
}

/** Aggregate, non-sensitive counts for the public site (no client names or data). */
export async function publicStats() {
  const [c] = await rootDb.select({ n: sql<number>`count(*)::int` }).from(tenants).where(sql`${tenants.suspendedAt} is null`);
  const [e] = await rootDb.select({ n: sql<number>`count(*)::int` }).from(contracts).where(eq(contracts.status, "active"));
  return { clients: c.n, employees: e.n };
}

/** Where public enquiries go: all Super Admins and consultants, plus CONTACT_EMAIL when set. */
export async function enquiryRecipients(): Promise<{ email: string; name?: string }[]> {
  const staff = await rootDb.select({ email: users.email, first: users.firstName }).from(users).where(sql`${users.isSuperAdmin} or ${users.isConsultant}`);
  const out = new Map<string, { email: string; name?: string }>(staff.map((s) => [s.email.toLowerCase(), { email: s.email, name: s.first }]));
  const extra = process.env.CONTACT_EMAIL?.trim().toLowerCase();
  if (extra && !out.has(extra)) out.set(extra, { email: extra });
  return [...out.values()];
}
export const contactInfo = () => ({ email: process.env.CONTACT_EMAIL || null, phone: process.env.CONTACT_PHONE || null, address: process.env.CONTACT_ADDRESS || null });
