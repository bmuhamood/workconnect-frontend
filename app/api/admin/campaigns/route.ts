import { z } from "zod";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { memberships, users, tenants } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { queueEmail, templates, brandOf, unsubscribeToken, appUrl, flushOutbox } from "@/lib/email";

// Marketing email to opted-in members of THIS tenant only.
export const POST = route({ roles: ["admin"] }, async (req, { session, db }) => {
  const d = await body(req, z.object({ subject: z.string().trim().min(3, "Add a subject").max(150), message: z.string().trim().min(10, "Write a message").max(5000), audience: z.enum(["all", "worker", "employer"]).default("all") }));
  const [t] = await db.select().from(tenants).limit(1);
  const rows = await db.select({ id: users.id, email: users.email, first: users.firstName }).from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(d.audience === "all" ? eq(memberships.marketingOptIn, true) : and(eq(memberships.marketingOptIn, true), eq(memberships.role, d.audience)));
  if (!rows.length) throw fail(400, "No opted-in recipients for this audience");
  for (const r of rows) {
    const unsub = `${appUrl()}/unsubscribe?token=${await unsubscribeToken(r.id, session.tenantId)}`;
    await queueEmail(db, { email: r.email, name: r.first }, templates.campaign(brandOf(t), { subject: d.subject, body: `Hi ${r.first},\n\n${d.message}`, unsubscribeUrl: unsub }), "campaign");
  }
  after(() => flushOutbox(50));
  return { queued: rows.length };
});
