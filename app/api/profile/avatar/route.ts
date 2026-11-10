import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { cloudinaryConfig, isTenantImageUrl } from "@/lib/cloudinary";

export const PATCH = route({}, async (req, { session }) => {
  const { url } = await body(req, z.object({ url: z.string().url().max(500).nullable() }));
  const cfg = cloudinaryConfig();
  if (url && (!cfg || !isTenantImageUrl(url, cfg.cloudName, session.tenantId))) throw fail(400, "That image was not uploaded through WorkConnect");
  await rootDb.update(users).set({ avatarUrl: url }).where(eq(users.id, session.userId));
  return { ok: true };
});
