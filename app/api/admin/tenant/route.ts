import { z } from "zod";
import { rootDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { tenants } from "@/db/schema";
import { route, body } from "@/lib/http";

// Tenants are not writable by the tenant role, so the update runs on the owner connection scoped to the caller's own tenant id.
export const PATCH = route({ roles: ["admin"] }, async (req, { session }) => {
  const d = await body(req, z.object({
    name: z.string().trim().min(2).max(120), brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #4f46e5"),
    serviceFeePercent: z.coerce.number().min(0).max(50), emailFromName: z.string().trim().max(120).optional(),
    contactEmail: z.union([z.string().trim().email("Enter a valid contact email"), z.literal("")]).optional(),
    contactPhone: z.string().trim().max(40).optional(), contactAddress: z.string().trim().max(300).optional(),
  }));
  await rootDb.update(tenants).set({ name: d.name, brandColor: d.brandColor, serviceFeeBps: Math.round(d.serviceFeePercent * 100), emailFromName: d.emailFromName || null, contactEmail: d.contactEmail || null, contactPhone: d.contactPhone || null, contactAddress: d.contactAddress || null }).where(eq(tenants.id, session.tenantId));
  return { ok: true };
});
