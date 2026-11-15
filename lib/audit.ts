import "server-only";
import { rootDb } from "@/lib/db";
import { auditLog } from "@/db/schema";

/** Append-only record of platform actions. Uses the unscoped connection; tenant roles have no access to this table. */
export async function audit(actor: { userId?: string; name: string }, action: string, o: { tenant?: { id: string; name: string }; detail?: string } = {}) {
  await rootDb.insert(auditLog).values({ actorId: actor.userId ?? null, actorName: actor.name, action, tenantId: o.tenant?.id ?? null, tenantName: o.tenant?.name ?? null, detail: o.detail ?? null });
}
