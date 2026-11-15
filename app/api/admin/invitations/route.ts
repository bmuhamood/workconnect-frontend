import { z } from "zod";
import { eq } from "drizzle-orm";
import { memberships, users } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { issueMemberInvite } from "@/lib/invite-actions";
import { emailRe } from "@/lib/invitations";
import { currentTenant } from "@/lib/tenant";

/** A client administrator invites their own managers, employees or fellow administrators. One person per line: "email" or "Name <email>" or "email, Name". */
export const POST = route({ roles: ["admin"] }, async (req, { session, db }) => {
  const d = await body(req, z.object({ lines: z.string().min(3, "Enter at least one email address").max(20000), role: z.enum(["admin", "employer", "worker"]) }));
  const tenant = await currentTenant();
  if (!tenant) throw fail(409, "Workspace not found");
  const parsed = d.lines.split(/\r?\n|;/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.*?)<\s*([^>\s]+)\s*>$/); if (m) return { email: m[2].toLowerCase(), name: m[1].trim() };
    const [a, b] = l.split(/[,\t]/).map((x) => x.trim()); return emailRe.test(a ?? "") ? { email: a.toLowerCase(), name: b ?? "" } : { email: (b ?? "").toLowerCase(), name: a ?? "" };
  });
  if (parsed.length > 100) throw fail(400, "Invite up to 100 people at a time");
  const existing = new Set((await db.select({ e: users.email }).from(memberships).innerJoin(users, eq(users.id, memberships.userId))).map((r) => r.e.toLowerCase()));
  const created: { email: string; url: string }[] = [], skipped: { email: string; reason: string }[] = [];
  const seen = new Set<string>();
  for (const p of parsed) {
    if (!emailRe.test(p.email)) { skipped.push({ email: p.email || "(blank)", reason: "Not a valid email address" }); continue; }
    if (seen.has(p.email)) continue; seen.add(p.email);
    if (existing.has(p.email)) { skipped.push({ email: p.email, reason: "Already a member of this workspace" }); continue; }
    const inv = await issueMemberInvite(db, { tenant, email: p.email, firstName: p.name.split(" ")[0] || undefined, role: d.role, inviter: { id: session.userId, name: session.name } });
    created.push({ email: p.email, url: inv.url });
  }
  if (!created.length && !skipped.length) throw fail(400, "No valid email addresses found");
  return { created, skipped };
});
