import { z } from "zod";
import { after, NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformLeads } from "@/db/schema";
import { errorResponse, fail, body } from "@/lib/http";
import { TOPICS } from "@/lib/contact-topics";
import { enquiryRecipients } from "@/lib/platform";
import { queuePlatformEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  company: z.string().trim().max(160).optional(), phone: z.string().trim().max(40).optional(),
  topic: z.enum(TOPICS, { message: "Choose a topic" }),
  message: z.string().trim().min(10, "Write at least a sentence so we can help").max(4000),
  website: z.string().max(200).optional(), // honeypot
});

/** Public enquiry form. Goes to WorkConnect (not to any client). Staff are emailed with Reply-To set to the visitor. */
export async function POST(req: Request) {
  try {
    const d = await body(req, schema);
    if (d.website) return NextResponse.json({ ok: true }); // bot
    const since = sql`now() - interval '1 hour'`;
    const [mine] = await rootDb.select({ n: sql<number>`count(*)::int` }).from(platformLeads).where(and(eq(platformLeads.email, d.email), gt(platformLeads.createdAt, since)));
    const [all] = await rootDb.select({ n: sql<number>`count(*)::int` }).from(platformLeads).where(gt(platformLeads.createdAt, since));
    if (mine.n >= 3 || all.n >= 100) throw fail(429, "You've sent several messages already. Please wait a while before sending another.");
    await rootDb.insert(platformLeads).values({ name: d.name, email: d.email, company: d.company || null, phone: d.phone || null, topic: d.topic, message: d.message });
    const brand = brandOf();
    const who = `${d.name}${d.company ? ` (${d.company})` : ""} <${d.email}>${d.phone ? `\nPhone: ${d.phone}` : ""}`;
    for (const r of await enquiryRecipients())
      await queuePlatformEmail(r, templates.notice(brand, { title: `New enquiry: ${d.topic}`, body: `From: ${who}\n\n${d.message}\n\nReply to this email to answer ${d.name} directly.`, cta: { label: "Open enquiries", url: appUrl() + "/platform/leads" } }), "lead_staff", { replyTo: d.email });
    await queuePlatformEmail({ email: d.email, name: d.name }, templates.notice(brand, { title: "We received your message", body: `Hi ${d.name.split(" ")[0]},\n\nThank you for contacting WorkConnect. We've received your message and will reply by email as soon as we can.\n\nYour message:\n${d.message}` }), "lead_receipt", { replyTo: process.env.CONTACT_EMAIL || undefined });
    after(() => flushOutbox(20));
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
