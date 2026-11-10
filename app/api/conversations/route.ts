import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, messages, memberships } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { getOrCreateConversation } from "@/lib/domain";

export const POST = route({}, async (req, { session, db }) => {
  const { userId, message } = await body(req, z.object({ userId: z.string().uuid(), message: z.string().trim().max(4000).optional() }));
  if (userId === session.userId) throw fail(400, "You can't message yourself");
  const [m] = await db.select({ id: memberships.id }).from(memberships).where(eq(memberships.userId, userId)).limit(1);
  if (!m) throw fail(404, "User not found");
  void users;
  const c = await getOrCreateConversation(db, session.userId, userId);
  if (message) await db.insert(messages).values({ conversationId: c.id, senderId: session.userId, body: message });
  return { id: c.id };
});
