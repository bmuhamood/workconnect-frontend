import { z } from "zod";
import { servicePackages } from "@/db/schema";
import { route, body } from "@/lib/http";

export const packageSchema = z.object({
  name: z.string().trim().min(2, "Enter a package name").max(80),
  tagline: z.string().trim().max(200).optional(),
  priceText: z.string().trim().min(1, "Enter a price or 'Custom quote'").max(80),
  billingNote: z.string().trim().max(120).optional(),
  features: z.string().transform((s) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 12)),
  highlighted: z.union([z.literal("on"), z.boolean()]).optional().transform((v) => v === "on" || v === true),
  sortOrder: z.coerce.number().int().min(0).max(99).optional(),
});

export const POST = route({ roles: ["admin"] }, async (req, { db }) => {
  const d = await body(req, packageSchema);
  const [p] = await db.insert(servicePackages).values({ name: d.name, tagline: d.tagline ?? "", priceText: d.priceText, billingNote: d.billingNote ?? "", features: d.features, highlighted: d.highlighted, sortOrder: d.sortOrder ?? 0 }).returning({ id: servicePackages.id });
  return { id: p.id };
});
