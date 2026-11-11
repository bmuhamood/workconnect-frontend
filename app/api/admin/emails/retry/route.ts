import { z } from "zod";
import { after } from "next/server";
import { and, eq, gt, or } from "drizzle-orm";
import { emailOutbox } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { flushOutbox } from "@/lib/email";

/**
 * Retry failed emails for THIS organisation (row-level security keeps other tenants out of reach).
 * With `id`: retry one email. Without: retry every failed email and every one still stuck retrying.
 * Resets the attempt counter, so each gets a fresh set of 5 tries.
 */
export const POST = route({ roles: ["admin"] }, async (req, { session, db }) => {
  const { id } = await body(req, z.object({ id: z.string().uuid().optional() }));
  const where = id
    ? and(eq(emailOutbox.id, id), or(eq(emailOutbox.status, "failed"), eq(emailOutbox.status, "queued")))
    : or(eq(emailOutbox.status, "failed"), and(eq(emailOutbox.status, "queued"), gt(emailOutbox.attempts, 0)));
  const rows = await db.update(emailOutbox).set({ status: "queued", attempts: 0, error: null }).where(where).returning({ id: emailOutbox.id });
  if (id && !rows.length) throw fail(404, "Email not found, or it was already sent");
  after(() => flushOutbox(100, session.tenantId)); // sends after the transaction commits
  return { retried: rows.length };
});
