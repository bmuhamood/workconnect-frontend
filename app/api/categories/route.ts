import { z } from "zod";
import { eq } from "drizzle-orm";
import { categories } from "@/db/schema";
import { route, body } from "@/lib/http";

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "category";

/** Lets an employer/admin add a category when the one they need isn't listed. Re-uses an existing one with the same name. */
export const POST = route({ roles: ["employer", "admin"] }, async (req, { db }) => {
  const { name } = await body(req, z.object({ name: z.string().trim().min(2, "Enter a category name").max(60) }));
  const slug = slugify(name);
  await db.insert(categories).values({ name, slug, icon: "briefcase" }).onConflictDoNothing();
  const [c] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return { id: c.id, name: c.name };
});
