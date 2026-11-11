import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { tenants } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";

/** Suspend or reactivate an organisation. Suspended organisations can't sign in; their data is kept. */
export const PATCH = platformRoute<{ id: string }>(async (req, { params }) => {
  const { action } = await body(req, z.object({ action: z.enum(["suspend", "activate"]) }));
  const [t] = await rootDb.select({ id: tenants.id }).from(tenants).where(eq(tenants.id, params.id)).limit(1);
  if (!t) throw fail(404, "Organisation not found");
  await rootDb.update(tenants).set({ suspendedAt: action === "suspend" ? new Date() : null }).where(eq(tenants.id, t.id));
  return { ok: true };
});
