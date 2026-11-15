import { z } from "zod";
import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { users, tenants, memberships, workerProfiles, employerProfiles, invitations } from "@/db/schema";
import { getIdentity } from "@/lib/identity";
import { TENANT_COOKIE } from "@/lib/session";
import { errorResponse, fail, body } from "@/lib/http";
import { queueEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";
import { hashToken } from "@/lib/invitations";
import { notify } from "@/lib/domain";
import { audit } from "@/lib/audit";

const phone = z.string().trim().transform((s) => s.replace(/[\s-]/g, "")).refine((s) => /^\+?[0-9]{9,15}$/.test(s), "Enter a valid phone number");
const schema = z.object({
  token: z.string().min(20, "This invitation link is incomplete"),
  firstName: z.string().trim().min(1, "First name is required").max(80), lastName: z.string().trim().min(1, "Last name is required").max(80), phone,
  city: z.string().trim().max(80).optional(), profession: z.string().trim().max(120).optional(), companyName: z.string().trim().max(160).optional(),
});

/** Completes an invitation: the signed-in identity must belong to the invited email address. Self-registration does not exist. */
export async function POST(req: Request) {
  try {
    const id = await getIdentity();
    if (!id) throw fail(401, "Please create your account or sign in first");
    const d = await body(req, schema);
    const [inv] = await rootDb.select().from(invitations).where(eq(invitations.tokenHash, hashToken(d.token))).limit(1);
    if (!inv || inv.revokedAt || inv.acceptedAt || inv.expiresAt < new Date()) throw fail(410, "This invitation is invalid, already used, or has expired. Ask for a new one.");
    if (inv.email.toLowerCase() !== id.email.toLowerCase()) throw fail(403, `This invitation was sent to ${inv.email}. Sign in or sign up with that email address.`);

    let [user] = await rootDb.select().from(users).where(eq(users.authId, id.authId)).limit(1);
    if (!user) [user] = await rootDb.insert(users).values({ authId: id.authId, email: id.email, phone: d.phone, firstName: d.firstName, lastName: d.lastName }).returning();
    else await rootDb.update(users).set({ phone: d.phone, firstName: d.firstName, lastName: d.lastName }).where(eq(users.id, user.id));

    if (inv.kind === "staff") {
      await rootDb.update(users).set({ isConsultant: true }).where(eq(users.id, user.id));
      await rootDb.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, inv.id));
      await audit({ userId: user.id, name: `${d.firstName} ${d.lastName}` }, "consultant_joined", { detail: id.email });
      return NextResponse.json({ ok: true, staff: true });
    }

    const [tenant] = await rootDb.select().from(tenants).where(and(eq(tenants.id, inv.tenantId!), isNull(tenants.suspendedAt))).limit(1);
    if (!tenant) throw fail(409, "This client workspace is not active. Please contact WorkConnect.");
    const role = inv.role as "admin" | "employer" | "worker";
    if (role === "worker" && !d.profession) throw fail(400, "Tell us your job title or profession");

    await withTenant({ tenantId: tenant.id, userId: user.id }, async (tx) => {
      if ((await tx.select({ id: memberships.id }).from(memberships).where(eq(memberships.userId, user.id)).limit(1)).length) throw fail(409, "You already have an account in this workspace. Sign in instead.");
      await tx.insert(memberships).values({ userId: user.id, role });
      if (role === "worker") await tx.insert(workerProfiles).values({ userId: user.id, profession: d.profession!, city: d.city || "Kampala" });
      else await tx.insert(employerProfiles).values({ userId: user.id, companyName: d.companyName || tenant.name, city: d.city || "Kampala" });
      await queueEmail(tx, { email: user.email, name: d.firstName }, templates.welcome(brandOf(tenant), { name: d.firstName, role, url: appUrl() + "/dashboard" }), "welcome");
      if (inv.invitedBy) await notify(tx, inv.invitedBy, { title: "Invitation accepted", body: `${d.firstName} ${d.lastName} joined as ${role}.`, link: "/admin" }).catch(() => {});
    });
    await rootDb.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, inv.id));
    after(() => flushOutbox(5));
    (await cookies()).set(TENANT_COOKIE, tenant.slug, { path: "/", sameSite: "lax", maxAge: 31536000 });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
