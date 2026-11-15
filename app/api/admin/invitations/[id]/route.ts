import { and, eq, isNull } from "drizzle-orm";
import { invitations } from "@/db/schema";
import { route, fail } from "@/lib/http";
import { issueMemberInvite } from "@/lib/invite-actions";
import { currentTenant } from "@/lib/tenant";

async function pending(db: Parameters<Parameters<typeof route>[1]>[1]["db"], id: string) {
  const [i] = await db.select().from(invitations).where(and(eq(invitations.id, id), isNull(invitations.acceptedAt), isNull(invitations.revokedAt))).limit(1);
  if (!i || i.kind !== "member") throw fail(404, "Invitation not found or already used");
  return i;
}
export const DELETE = route<{ id: string }>({ roles: ["admin"] }, async (_req, { params, db }) => {
  const i = await pending(db, params.id);
  await db.update(invitations).set({ revokedAt: new Date() }).where(eq(invitations.id, i.id));
  return { ok: true };
});
/** Resend: issues a fresh link (the old one stops working). */
export const POST = route<{ id: string }>({ roles: ["admin"] }, async (_req, { params, session, db }) => {
  const i = await pending(db, params.id);
  const tenant = await currentTenant(); if (!tenant) throw fail(409, "Workspace not found");
  const inv = await issueMemberInvite(db, { tenant, email: i.email, firstName: i.firstName ?? undefined, role: i.role as "admin" | "employer" | "worker", inviter: { id: session.userId, name: session.name } });
  return { url: inv.url };
});
