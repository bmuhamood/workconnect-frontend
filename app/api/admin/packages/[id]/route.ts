import { z } from "zod";
import { eq } from "drizzle-orm";
import { servicePackages } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { packageSchema } from "../route";

export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, db }) => {
  const d = await body(req, packageSchema.partial().extend({ active: z.boolean().optional() }));
  const set: Partial<typeof servicePackages.$inferInsert> = {};
  if (d.name !== undefined) set.name = d.name; if (d.tagline !== undefined) set.tagline = d.tagline; if (d.priceText !== undefined) set.priceText = d.priceText;
  if (d.billingNote !== undefined) set.billingNote = d.billingNote; if (d.features !== undefined) set.features = d.features;
  if (d.highlighted !== undefined) set.highlighted = d.highlighted; if (d.sortOrder !== undefined) set.sortOrder = d.sortOrder; if (d.active !== undefined) set.active = d.active;
  const r = await db.update(servicePackages).set(set).where(eq(servicePackages.id, params.id)).returning({ id: servicePackages.id });
  if (!r.length) throw fail(404, "Package not found");
  return { ok: true };
});
export const DELETE = route<{ id: string }>({ roles: ["admin"] }, async (_req, { params, db }) => {
  const r = await db.delete(servicePackages).where(eq(servicePackages.id, params.id)).returning({ id: servicePackages.id });
  if (!r.length) throw fail(404, "Package not found");
  return { ok: true };
});
