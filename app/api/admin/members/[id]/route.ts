import { z } from "zod";
import { eq } from "drizzle-orm";
import { memberships } from "@/db/schema";
import { route, body, fail } from "@/lib/http";

export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, session, db }) => {
  const { role } = await body(req, z.object({ role: z.enum(["worker", "employer", "admin"]) }));
  if (params.id === session.userId) throw fail(400, "You can't change your own role");
  const r = await db.update(memberships).set({ role }).where(eq(memberships.userId, params.id)).returning({ id: memberships.id });
  if (!r.length) throw fail(404, "Member not found");
  return { ok: true };
});
export const DELETE = route<{ id: string }>({ roles: ["admin"] }, async (_req, { params, session, db }) => {
  if (params.id === session.userId) throw fail(400, "You can't remove yourself");
  const r = await db.delete(memberships).where(eq(memberships.userId, params.id)).returning({ id: memberships.id });
  if (!r.length) throw fail(404, "Member not found");
  return { ok: true };
});
