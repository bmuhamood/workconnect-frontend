import { z } from "zod";
import { rootDb } from "@/lib/db";
import { platformPackages } from "@/db/schema";
import { platformRoute, body } from "@/lib/http";

export const packageSchema = z.object({
  name: z.string().trim().min(2, "Enter a package name").max(80),
  tagline: z.string().trim().max(200).optional(),
  priceText: z.string().trim().min(1, "Enter a price or 'Custom quote'").max(80),
  billingNote: z.string().trim().max(120).optional(),
  features: z.string().transform((s) => s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).slice(0, 12)),
  highlighted: z.union([z.literal("on"), z.boolean()]).optional().transform((v) => v === "on" || v === true),
  sortOrder: z.coerce.number().int().min(0).max(99).optional(),
});
export const POST = platformRoute(async (req) => {
  const d = await body(req, packageSchema);
  const [p] = await rootDb.insert(platformPackages).values({ name: d.name, tagline: d.tagline ?? "", priceText: d.priceText, billingNote: d.billingNote ?? "", features: d.features, highlighted: d.highlighted, sortOrder: d.sortOrder ?? 0 }).returning({ id: platformPackages.id });
  return { id: p.id };
});
