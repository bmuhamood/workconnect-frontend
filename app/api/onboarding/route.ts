import { z } from "zod";
import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { users, tenants, memberships, workerProfiles, employerProfiles, categories } from "@/db/schema";
import { getIdentity } from "@/lib/identity";
import { currentTenant } from "@/lib/tenant";
import { TENANT_COOKIE } from "@/lib/session";
import { errorResponse, fail, body } from "@/lib/http";
import { queueEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";
import { DEFAULT_CATEGORIES } from "@/lib/domain-constants";

const phone = z.string().trim().transform((s) => s.replace(/[\s-]/g, "")).refine((s) => /^\+?[0-9]{9,15}$/.test(s), "Enter a valid phone number");
const schema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("worker"), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone, city: z.string().trim().min(1).max(80), profession: z.string().trim().min(2, "Tell us your profession").max(120) }),
  z.object({ role: z.literal("employer"), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone, city: z.string().trim().min(1).max(80), companyName: z.string().trim().max(160).optional() }),
  z.object({ role: z.literal("agency"), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone, city: z.string().trim().min(1).max(80), agencyName: z.string().trim().min(2, "Enter your organisation name").max(120) }),
]);
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "tenant";

/** Called right after the identity (Neon Auth or local) exists: creates the app user, tenant membership and profile. */
export async function POST(req: Request) {
  try {
    const id = await getIdentity();
    if (!id) throw fail(401, "Please sign in to continue");
    const d = await body(req, schema);

    let [user] = await rootDb.select().from(users).where(eq(users.authId, id.authId)).limit(1);
    if (!user) {
      [user] = await rootDb.insert(users).values({ authId: id.authId, email: id.email, phone: d.phone, firstName: d.firstName, lastName: d.lastName }).returning();
    } else {
      await rootDb.update(users).set({ phone: d.phone, firstName: d.firstName, lastName: d.lastName }).where(eq(users.id, user.id));
    }

    let tenant: typeof tenants.$inferSelect;
    let role: "worker" | "employer" | "admin";
    if (d.role === "agency") {
      let slug = slugify(d.agencyName);
      if ((await rootDb.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)).limit(1)).length) slug += "-" + Math.random().toString(36).slice(2, 6);
      [tenant] = await rootDb.insert(tenants).values({ name: d.agencyName, slug }).returning();
      await withTenant({ tenantId: tenant.id, userId: user.id }, (tx) => tx.insert(categories).values(DEFAULT_CATEGORIES.map(([name, slug, icon]) => ({ name, slug, icon }))));
      role = "admin";
    } else {
      const t = await currentTenant();
      if (!t) throw fail(400, "No organisation selected. Open your organisation's sign-up link.");
      tenant = t; role = d.role;
    }

    const brand = brandOf(tenant);
    await withTenant({ tenantId: tenant.id, userId: user.id }, async (tx) => {
      const dup = await tx.select({ id: memberships.id }).from(memberships).where(eq(memberships.userId, user.id)).limit(1);
      if (dup.length) throw fail(409, "You already have an account in this organisation. Sign in instead.");
      await tx.insert(memberships).values({ userId: user.id, role });
      if (d.role === "worker") await tx.insert(workerProfiles).values({ userId: user.id, profession: d.profession, city: d.city });
      if (d.role === "employer") await tx.insert(employerProfiles).values({ userId: user.id, companyName: d.companyName || null, city: d.city });
      await queueEmail(tx, { email: user.email, name: d.firstName }, templates.welcome(brand, { name: d.firstName, role, url: appUrl() + "/dashboard" }), "welcome");
    });
    after(() => flushOutbox(5));
    (await cookies()).set(TENANT_COOKIE, tenant.slug, { path: "/", sameSite: "lax", maxAge: 31536000 });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
