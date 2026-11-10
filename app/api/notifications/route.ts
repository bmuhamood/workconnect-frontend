import { and, eq, isNull } from "drizzle-orm";
import { notifications } from "@/db/schema";
import { route } from "@/lib/http";
export const POST = route({}, async (_req, { session, db }) => {
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, session.userId), isNull(notifications.readAt)));
  return { ok: true };
});
