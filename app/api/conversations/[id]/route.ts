import { z } from "zod";
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { conversations, messages } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { isParticipant, notify } from "@/lib/domain";
import type { Tx } from "@/lib/db";

async function load(db: Tx, id: string, uid: string) {
  const [c] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!c || !isParticipant(c, uid)) throw fail(404, "Conversation not found");
  return c;
}
export const GET = route<{ id: string }>({}, async (_req, { params, session, db }) => {
  const c = await load(db, params.id, session.userId);
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.conversationId, c.id), ne(messages.senderId, session.userId), isNull(messages.readAt)));
  const list = await db.select({ id: messages.id, senderId: messages.senderId, body: messages.body, createdAt: messages.createdAt }).from(messages).where(eq(messages.conversationId, c.id)).orderBy(asc(messages.createdAt)).limit(500);
  return { messages: list };
});
export const POST = route<{ id: string }>({}, async (req, { params, session, db }) => {
  const { message } = await body(req, z.object({ message: z.string().trim().min(1, "Type a message").max(4000) }));
  const c = await load(db, params.id, session.userId);
  await db.insert(messages).values({ conversationId: c.id, senderId: session.userId, body: message });
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, c.id));
  await notify(db, c.userA === session.userId ? c.userB : c.userA, { title: "New message", body: `${session.name}: ${message.slice(0, 80)}`, link: `/messages?c=${c.id}` });
  return { ok: true };
});
