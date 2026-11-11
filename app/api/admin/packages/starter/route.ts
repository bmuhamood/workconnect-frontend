import { servicePackages } from "@/db/schema";
import { route, fail } from "@/lib/http";
import { DEFAULT_PACKAGES } from "@/lib/domain-constants";

export const POST = route({ roles: ["admin"] }, async (_req, { db }) => {
  if ((await db.select({ id: servicePackages.id }).from(servicePackages).limit(1)).length) throw fail(409, "You already have packages");
  await db.insert(servicePackages).values(DEFAULT_PACKAGES.map((p, i) => ({ ...p, features: [...p.features], sortOrder: i })));
  return { ok: true };
});
