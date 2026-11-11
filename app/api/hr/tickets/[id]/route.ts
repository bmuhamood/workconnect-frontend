import { z } from "zod";
import { eq } from "drizzle-orm";
import { supportTickets, ticketMessages } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify, notifyAdmins } from "@/lib/domain";
import type { Tx } from "@/lib/db";
import type { Session } from "@/lib/session";

async function load(db: Tx, id: string, s: Session) {
  const [t] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  if (!t || (s.role !== "admin" && t.requesterId !== s.userId)) throw fail(404, "Request not found");
  return t;
}
export const POST = route<{ id: string }>({}, async (req, { params, session: s, db }) => {
  const { message } = await body(req, z.object({ message: z.string().trim().min(1, "Type a reply").max(4000) }));
  const t = await load(db, params.id, s);
  if (t.status === "resolved" && s.role === "admin") throw fail(409, "This request is resolved. Reopen it to reply.");
  await db.insert(ticketMessages).values({ ticketId: t.id, authorId: s.userId, body: message });
  await db.update(supportTickets).set({ updatedAt: new Date(), status: s.role === "admin" && t.status === "open" ? "in_progress" : t.status === "resolved" ? "open" : t.status }).where(eq(supportTickets.id, t.id));
  if (s.role === "admin") await notify(db, t.requesterId, { title: `HR replied: ${t.subject}`, body: message.slice(0, 200), link: `/hr/support/${t.id}`, email: true });
  else await notifyAdmins(db, { title: `New reply: ${t.subject}`, body: `${s.name}: ${message.slice(0, 120)}`, link: `/hr/support/${t.id}` });
  return { ok: true };
});
export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, session, db }) => {
  const { status } = await body(req, z.object({ status: z.enum(["open", "in_progress", "resolved"]) }));
  const t = await load(db, params.id, session);
  await db.update(supportTickets).set({ status, updatedAt: new Date() }).where(eq(supportTickets.id, t.id));
  if (status === "resolved") await notify(db, t.requesterId, { title: `Resolved: ${t.subject}`, body: "Your HR request was marked resolved. Reply if you need more help.", link: `/hr/support/${t.id}`, email: true });
  return { ok: true };
});
