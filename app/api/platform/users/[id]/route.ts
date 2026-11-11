import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";

/** Deactivate / reactivate any account (a deactivated user can no longer sign in to the app). */
export const PATCH = platformRoute<{ id: string }>(async (req, { params, admin }) => {
  const { action } = await body(req, z.object({ action: z.enum(["deactivate", "activate"]) }));
  const [u] = await rootDb.select().from(users).where(eq(users.id, params.id)).limit(1);
  if (!u) throw fail(404, "User not found");
  if (u.isSuperAdmin || u.id === admin.userId) throw fail(409, "Platform administrators can't be changed here");
  await rootDb.update(users).set({ isActive: action === "activate" }).where(eq(users.id, u.id));
  return { ok: true };
});
