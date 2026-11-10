import { after } from "next/server";
import { tenants } from "@/db/schema";
import { route } from "@/lib/http";
import { queueEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";

/** Sends a branded test email to the signed-in admin so delivery (Resend + verified domain) can be checked end to end. */
export const POST = route({ roles: ["admin"] }, async (_req, { session, db }) => {
  const [t] = await db.select().from(tenants).limit(1);
  await queueEmail(db, { email: session.email, name: session.name }, templates.notice(brandOf(t), {
    title: "Test email from WorkConnect",
    body: `Hi ${session.name.split(" ")[0]},\n\nIf you can read this, email delivery for ${t.name} is working.`,
    cta: { label: "Open your dashboard", url: appUrl() + "/dashboard" },
  }), "test");
  after(() => flushOutbox(5)); // runs after the transaction commits
  return { ok: true, to: session.email };
});
