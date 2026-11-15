import { and, eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, memberships } from "@/db/schema";
import { platformRoute, fail } from "@/lib/http";
import { audit } from "@/lib/audit";

/** Remove consultant access: the person loses staff status and every client workspace they had entered. */
export const DELETE = platformRoute<{ id: string }>(async (_req, { params, admin }) => {
  const [u] = await rootDb.select().from(users).where(eq(users.id, params.id)).limit(1);
  if (!u || !u.isConsultant) throw fail(404, "Consultant not found");
  if (u.isSuperAdmin) throw fail(409, "A Super Admin can't be changed here");
  await rootDb.update(users).set({ isConsultant: false }).where(eq(users.id, u.id));
  await rootDb.delete(memberships).where(and(eq(memberships.userId, u.id), eq(memberships.isConsultant, true)));
  await audit(admin, "consultant_removed", { detail: u.email });
  return { ok: true };
});
