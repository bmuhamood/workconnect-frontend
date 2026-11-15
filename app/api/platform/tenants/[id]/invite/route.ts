import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { tenants } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { issueMemberInvite } from "@/lib/invite-actions";
import { audit } from "@/lib/audit";
import { emailRe } from "@/lib/invitations";

/** Invite (another) administrator for a client. */
export const POST = platformRoute<{ id: string }>(async (req, { params, admin }) => {
  const d = await body(req, z.object({ email: z.string().trim().toLowerCase().refine((s) => emailRe.test(s), "Enter a valid email"), firstName: z.string().trim().max(80).optional() }));
  const [t] = await rootDb.select().from(tenants).where(eq(tenants.id, params.id)).limit(1);
  if (!t) throw fail(404, "Client not found");
  const inv = await withTenant({ tenantId: t.id, userId: admin.userId }, (tx) => issueMemberInvite(tx, { tenant: t, email: d.email, firstName: d.firstName, role: "admin", inviter: { id: admin.userId, name: admin.name } }));
  await audit(admin, "client_admin_invited", { tenant: t, detail: d.email });
  return { inviteUrl: inv.url };
});
