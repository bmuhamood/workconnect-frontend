import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { rootDb, type Tx } from "@/lib/db";
import { emailOutbox, tenants } from "@/db/schema";
import { templates, type Brand, type Rendered } from "@/lib/email/templates";

export const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEON_AUTH_COOKIE_SECRET || "");
export const unsubscribeToken = (userId: string, tenantId: string) =>
  new SignJWT({ t: tenantId }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).sign(secret());
export async function readUnsubscribeToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret()); return { userId: payload.sub!, tenantId: String(payload.t) }; } catch { return null; }
}

export type TenantBrand = { id: string; name: string; brandColor: string; emailFromName?: string | null };
export const brandOf = (t: TenantBrand): Brand => ({ name: t.name, color: t.brandColor });
export { templates };

/** Queue an email inside the current tenant transaction. Delivery happens after the response (see `flushOutbox`). */
export async function queueEmail(tx: Tx, to: { email: string; name?: string }, r: Rendered, template: string) {
  await tx.insert(emailOutbox).values({ toEmail: to.email, toName: to.name ?? null, template, subject: r.subject, html: r.html, text: r.text });
}

type Row = typeof emailOutbox.$inferSelect;
async function deliver(row: Row, from: string, headers?: Record<string, string>): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (process.env.EMAIL_TRANSPORT === "log") { console.log(`[email:log] to=${row.toEmail} subject="${row.subject}"`); return { ok: true, id: "log" }; }
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "No email provider configured (set RESEND_API_KEY and EMAIL_FROM)" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [row.toName ? `${row.toName} <${row.toEmail}>` : row.toEmail], subject: row.subject, html: row.html, text: row.text, headers }),
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  return res.ok ? { ok: true, id: json.id } : { ok: false, error: json.message ?? `HTTP ${res.status}` };
}

/** Sends queued/failed emails (max 5 attempts). Runs after each request and from the cron. Uses the owner role on purpose. */
export async function flushOutbox(limit = 25) {
  const rows = await rootDb.select({ r: emailOutbox, t: tenants }).from(emailOutbox)
    .innerJoin(tenants, eq(tenants.id, emailOutbox.tenantId))
    .where(and(inArray(emailOutbox.status, ["queued", "failed"]), lt(emailOutbox.attempts, 5)))
    .orderBy(emailOutbox.createdAt).limit(limit);
  let sent = 0;
  for (const { r, t } of rows) {
    const addr = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const from = `${t.emailFromName || t.name} <${addr.replace(/^.*<|>$/g, "")}>`;
    const unsub = r.template === "campaign" ? { "List-Unsubscribe": `<${appUrl()}/unsubscribe>` } : undefined;
    const out = await deliver(r, from, unsub).catch((e) => ({ ok: false, error: String(e) }) as { ok: boolean; id?: string; error?: string });
    await rootDb.update(emailOutbox).set(out.ok
      ? { status: "sent", sentAt: new Date(), providerId: out.id ?? null, attempts: sql`${emailOutbox.attempts} + 1`, error: null }
      : { status: (r.attempts + 1 >= 5 ? "failed" : "queued") as "failed" | "queued", attempts: sql`${emailOutbox.attempts} + 1`, error: out.error ?? "unknown" })
      .where(eq(emailOutbox.id, r.id));
    if (out.ok) sent++;
  }
  return { processed: rows.length, sent };
}
void or;
