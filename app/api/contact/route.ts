import { z } from "zod";
import { after, NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { withTenant } from "@/lib/db";
import { contactMessages, memberships, users } from "@/db/schema";
import { currentTenant } from "@/lib/tenant";
import { errorResponse, fail, body } from "@/lib/http";
import { notify } from "@/lib/domain";
import { TOPICS } from "@/lib/contact-topics";
import { queueEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  topic: z.enum(TOPICS, { message: "Choose a topic" }),
  message: z.string().trim().min(10, "Write at least a sentence so we can help").max(4000),
  website: z.string().max(200).optional(), // honeypot: real people never fill this in
});

/** Public contact form. Stored in the tenant's own inbox; admins are emailed with Reply-To set to the visitor. */
export async function POST(req: Request) {
  try {
    const tenant = await currentTenant();
    if (!tenant) throw fail(503, "Contact is not available yet");
    const d = await body(req, schema);
    if (d.website) return NextResponse.json({ ok: true }); // bot: pretend success, store nothing

    await withTenant({ tenantId: tenant.id }, async (tx) => {
      const since = sql`now() - interval '1 hour'`;
      const [mine] = await tx.select({ n: sql<number>`count(*)::int` }).from(contactMessages).where(and(eq(contactMessages.email, d.email), gt(contactMessages.createdAt, since)));
      const [all] = await tx.select({ n: sql<number>`count(*)::int` }).from(contactMessages).where(gt(contactMessages.createdAt, since));
      if (mine.n >= 3 || all.n >= 60) throw fail(429, "You've sent several messages already. Please wait a while before sending another.");

      await tx.insert(contactMessages).values({ name: d.name, email: d.email, topic: d.topic, message: d.message });
      const brand = brandOf(tenant);
      const admins = await tx.select({ id: users.id }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.role, "admin"));
      for (const a of admins) await notify(tx, a.id, { title: `New contact message: ${d.topic}`, body: `From ${d.name} (${d.email})`, link: "/admin" });
      // One email per admin carrying the message itself; replying goes straight to the visitor.
      const adminRows = await tx.select({ email: users.email, first: users.firstName }).from(memberships).innerJoin(users, eq(users.id, memberships.userId)).where(eq(memberships.role, "admin"));
      for (const a of adminRows)
        await queueEmail(tx, { email: a.email, name: a.first }, templates.notice(brand, { title: `New contact message: ${d.topic}`, body: `From: ${d.name} <${d.email}>\n\n${d.message}\n\nReply to this email to answer ${d.name} directly.`, cta: { label: "Open admin inbox", url: appUrl() + "/admin" } }), "contact_admin", { replyTo: d.email });
      await queueEmail(tx, { email: d.email, name: d.name }, templates.notice(brand, { title: "We received your message", body: `Hi ${d.name.split(" ")[0]},\n\nThanks for contacting ${tenant.name}. We've received your message and will reply by email as soon as we can.\n\nYour message:\n${d.message}` }), "contact_receipt", { replyTo: tenant.contactEmail ?? undefined });
    });
    after(() => flushOutbox(20));
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
