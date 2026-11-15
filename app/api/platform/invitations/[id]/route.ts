import { and, eq, isNull } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { invitations, tenants } from "@/db/schema";
import { platformRoute, fail } from "@/lib/http";
import { audit } from "@/lib/audit";

/** Revoke a pending invitation (any client, or a staff invitation). */
export const DELETE = platformRoute<{ id: string }>(async (_req, { params, admin }) => {
  const [i] = await rootDb.select().from(invitations).where(and(eq(invitations.id, params.id), isNull(invitations.acceptedAt), isNull(invitations.revokedAt))).limit(1);
  if (!i) throw fail(404, "Invitation not found or already used");
  await rootDb.update(invitations).set({ revokedAt: new Date() }).where(eq(invitations.id, i.id));
  const [t] = i.tenantId ? await rootDb.select().from(tenants).where(eq(tenants.id, i.tenantId)).limit(1) : [undefined];
  await audit(admin, "invitation_revoked", { tenant: t, detail: i.email });
  return { ok: true };
});
