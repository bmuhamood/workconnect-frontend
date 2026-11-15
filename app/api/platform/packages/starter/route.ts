import { rootDb } from "@/lib/db";
import { platformPackages } from "@/db/schema";
import { platformRoute, fail } from "@/lib/http";
import { DEFAULT_PACKAGES } from "@/lib/domain-constants";

export const POST = platformRoute(async () => {
  if ((await rootDb.select({ id: platformPackages.id }).from(platformPackages).limit(1)).length) throw fail(409, "You already have packages");
  await rootDb.insert(platformPackages).values(DEFAULT_PACKAGES.map((p, i) => ({ ...p, features: [...p.features], sortOrder: i })));
  return { ok: true };
});
