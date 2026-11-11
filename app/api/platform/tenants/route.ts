import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { users, tenants, memberships, categories, servicePackages } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { LOCAL_PASSWORDS } from "@/lib/auth-mode";
import { hashPassword } from "@/lib/identity";
import { DEFAULT_CATEGORIES, DEFAULT_PACKAGES } from "@/lib/domain-constants";

const phone = z.string().trim().transform((s) => s.replace(/[\s-]/g, "")).refine((s) => /^\+?[0-9]{9,15}$/.test(s), "Enter a valid phone number");
const schema = z.object({
  orgName: z.string().trim().min(2, "Enter the organisation name").max(120),
  firstName: z.string().trim().min(1, "Owner first name is required").max(80), lastName: z.string().trim().min(1, "Owner last name is required").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid owner email"), phone,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "org";

/** Super admin onboards a new HR consultancy together with its owner account. */
export const POST = platformRoute(async (req) => {
  if (!LOCAL_PASSWORDS) throw fail(409, "This deployment signs people in with Neon Auth, which can't be pre-provisioned from here. Ask the owner to use “Register your HR firm” on the home page instead.");
  const d = await body(req, schema);
  if ((await rootDb.select({ id: users.id }).from(users).where(eq(users.email, d.email)).limit(1)).length) throw fail(409, "A user with this email already exists");
  let slug = slugify(d.orgName);
  if ((await rootDb.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)).limit(1)).length) slug += "-" + Math.random().toString(36).slice(2, 6);
  const [tenant] = await rootDb.insert(tenants).values({ name: d.orgName, slug }).returning();
  const [owner] = await rootDb.insert(users).values({ authId: crypto.randomUUID(), email: d.email, phone: d.phone, passwordHash: await hashPassword(d.password), firstName: d.firstName, lastName: d.lastName }).returning();
  await withTenant({ tenantId: tenant.id, userId: owner.id }, async (tx) => {
    await tx.insert(memberships).values({ userId: owner.id, role: "admin" });
    await tx.insert(categories).values(DEFAULT_CATEGORIES.map(([name, s, icon]) => ({ name, slug: s, icon })));
    await tx.insert(servicePackages).values(DEFAULT_PACKAGES.map((p, i) => ({ ...p, features: [...p.features], sortOrder: i })));
  });
  return { id: tenant.id, slug };
});
