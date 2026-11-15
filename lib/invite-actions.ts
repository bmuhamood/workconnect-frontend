import "server-only";
import { after } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { rootDb, type Tx } from "@/lib/db";
import { invitations, emailOutbox } from "@/db/schema";
import { WORKCONNECT_COLOR, templates, queuePlatformEmail, flushOutbox, brandOf } from "@/lib/email";
import { hashToken, inviteExpiry, inviteUrl, newToken, INVITE_DAYS, ROLE_LABEL } from "@/lib/invitations";

void emailOutbox; void WORKCONNECT_COLOR;
/** Creates a member invitation inside a client workspace, revokes any older pending one for that email, and emails the link. */
export async function issueMemberInvite(tx: Tx, o: { tenant: { id: string; name: string }; email: string; firstName?: string; role: "admin" | "employer" | "worker"; inviter: { id: string; name: string } }) {
  const email = o.email.trim().toLowerCase();
  await tx.update(invitations).set({ revokedAt: new Date() }).where(and(eq(invitations.email, email), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)));
  const token = newToken();
  const [row] = await tx.insert(invitations).values({ kind: "member", email, firstName: o.firstName || null, role: o.role, tokenHash: hashToken(token), invitedBy: o.inviter.id, expiresAt: inviteExpiry() }).returning({ id: invitations.id });
  const url = inviteUrl(token);
  await queuePlatformEmail({ email, name: o.firstName }, templates.invite(brandOf({ id: o.tenant.id, name: o.tenant.name, brandColor: WORKCONNECT_COLOR }), { name: o.firstName, inviter: o.inviter.name, org: o.tenant.name, role: ROLE_LABEL[o.role].toLowerCase(), url, expiresDays: INVITE_DAYS }), "invite");
  after(() => flushOutbox(10));
  return { id: row.id, url, email };
}

/** Invitation to become WorkConnect staff (consultant). Not tied to any client. */
export async function issueStaffInvite(o: { email: string; firstName?: string; inviter: { id: string; name: string } }) {
  const email = o.email.trim().toLowerCase();
  await rootDb.update(invitations).set({ revokedAt: new Date() }).where(and(eq(invitations.email, email), eq(invitations.kind, "staff"), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)));
  const token = newToken();
  const [row] = await rootDb.insert(invitations).values({ tenantId: null, kind: "staff", email, firstName: o.firstName || null, role: null, tokenHash: hashToken(token), invitedBy: o.inviter.id, expiresAt: inviteExpiry() }).returning({ id: invitations.id });
  const url = inviteUrl(token);
  await queuePlatformEmail({ email, name: o.firstName }, templates.invite(brandOf(), { name: o.firstName, inviter: o.inviter.name, url, staff: true, expiresDays: INVITE_DAYS }), "invite");
  after(() => flushOutbox(10));
  return { id: row.id, url, email };
}
