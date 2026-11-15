import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { tenants } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { audit } from "@/lib/audit";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suspend") }), z.object({ action: z.literal("activate") }),
  z.object({ action: z.literal("update"), name: z.string().trim().min(2).max(120), industry: z.string().trim().max(80).optional(), serviceFeePercent: z.coerce.number().min(0).max(50) }),
]);
/** Suspend/reactivate a client, or edit its name and WorkConnect service fee. Suspended clients can't sign in; their data is kept. */
export const PATCH = platformRoute<{ id: string }>(async (req, { params, admin }) => {
  const d = await body(req, schema);
  const [t] = await rootDb.select().from(tenants).where(eq(tenants.id, params.id)).limit(1);
  if (!t) throw fail(404, "Client not found");
  if (d.action === "update") await rootDb.update(tenants).set({ name: d.name, industry: d.industry || null, serviceFeeBps: Math.round(d.serviceFeePercent * 100) }).where(eq(tenants.id, t.id));
  else await rootDb.update(tenants).set({ suspendedAt: d.action === "suspend" ? new Date() : null }).where(eq(tenants.id, t.id));
  await audit(admin, `client_${d.action}`, { tenant: t });
  return { ok: true };
});
