import { z } from "zod";
import { eq } from "drizzle-orm";
import { workerProfiles } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";

export const PATCH = route<{ id: string }>({ roles: ["admin"] }, async (req, { params, db }) => {
  const { verified } = await body(req, z.object({ verified: z.boolean() }));
  const r = await db.update(workerProfiles).set({ verified }).where(eq(workerProfiles.userId, params.id)).returning({ id: workerProfiles.id });
  if (!r.length) throw fail(404, "Worker not found");
  if (verified) await notify(db, params.id, { title: "Profile verified", body: "Your profile now shows the verified badge, so employers can trust you more.", link: "/profile", email: true });
  return { ok: true };
});
