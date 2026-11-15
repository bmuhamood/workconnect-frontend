import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { tenants, categories } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { DEFAULT_CATEGORIES } from "@/lib/domain-constants";
import { issueMemberInvite } from "@/lib/invite-actions";
import { audit } from "@/lib/audit";
import { emailRe } from "@/lib/invitations";

const schema = z.object({
  orgName: z.string().trim().min(2, "Enter the client's organisation name").max(120),
  industry: z.string().trim().max(80).optional(),
  adminEmail: z.string().trim().toLowerCase().refine((s) => emailRe.test(s), "Enter the administrator's email"),
  adminFirstName: z.string().trim().max(80).optional(),
});
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "client";

/** WorkConnect onboards a client organisation and invites its administrator. The client's data lives in its own isolated workspace. */
export const POST = platformRoute(async (req, { admin }) => {
  const d = await body(req, schema);
  let slug = slugify(d.orgName);
  if ((await rootDb.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)).limit(1)).length) slug += "-" + Math.random().toString(36).slice(2, 6);
  const [tenant] = await rootDb.insert(tenants).values({ name: d.orgName, slug, industry: d.industry || null }).returning();
  const inv = await withTenant({ tenantId: tenant.id, userId: admin.userId }, async (tx) => {
    await tx.insert(categories).values(DEFAULT_CATEGORIES.map(([name, s, icon]) => ({ name, slug: s, icon })));
    return issueMemberInvite(tx, { tenant, email: d.adminEmail, firstName: d.adminFirstName, role: "admin", inviter: { id: admin.userId, name: admin.name } });
  });
  await audit(admin, "client_created", { tenant, detail: `administrator invited: ${d.adminEmail}` });
  if (!tenant) throw fail(500, "Could not create the client");
  return { id: tenant.id, slug, inviteUrl: inv.url };
});
