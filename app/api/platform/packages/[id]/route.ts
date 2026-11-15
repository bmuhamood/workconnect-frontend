import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformPackages } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { packageSchema } from "../route";

export const PATCH = platformRoute<{ id: string }>(async (req, { params }) => {
  const d = await body(req, packageSchema.partial().extend({ active: z.boolean().optional() }));
  const set: Partial<typeof platformPackages.$inferInsert> = {};
  if (d.name !== undefined) set.name = d.name; if (d.tagline !== undefined) set.tagline = d.tagline; if (d.priceText !== undefined) set.priceText = d.priceText;
  if (d.billingNote !== undefined) set.billingNote = d.billingNote; if (d.features !== undefined) set.features = d.features;
  if (d.highlighted !== undefined) set.highlighted = d.highlighted; if (d.sortOrder !== undefined) set.sortOrder = d.sortOrder; if (d.active !== undefined) set.active = d.active;
  const r = await rootDb.update(platformPackages).set(set).where(eq(platformPackages.id, params.id)).returning({ id: platformPackages.id });
  if (!r.length) throw fail(404, "Package not found");
  return { ok: true };
});
export const DELETE = platformRoute<{ id: string }>(async (_req, { params }) => {
  const r = await rootDb.delete(platformPackages).where(eq(platformPackages.id, params.id)).returning({ id: platformPackages.id });
  if (!r.length) throw fail(404, "Package not found");
  return { ok: true };
});
