import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { reviews, contracts, workerProfiles } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";

export const POST = route({ roles: ["employer", "worker"] }, async (req, { session: s, db }) => {
  const d = await body(req, z.object({ contractId: z.string().uuid(), rating: z.coerce.number().int().min(1, "Choose a rating").max(5), comment: z.string().trim().min(5, "Write a short comment").max(2000) }));
  const [c] = await db.select().from(contracts).where(eq(contracts.id, d.contractId)).limit(1);
  if (!c || (c.employerId !== s.userId && c.workerId !== s.userId)) throw fail(404, "Contract not found");
  if (c.status !== "completed") throw fail(409, "You can review once the contract is completed");
  const revieweeId = c.employerId === s.userId ? c.workerId : c.employerId;
  const r = await db.insert(reviews).values({ contractId: c.id, reviewerId: s.userId, revieweeId, rating: d.rating, comment: d.comment }).onConflictDoNothing().returning({ id: reviews.id });
  if (!r.length) throw fail(409, "You already reviewed this contract");
  await db.update(workerProfiles).set({
    ratingAvg: sql`COALESCE((SELECT ROUND(AVG(rating) * 100) FROM reviews WHERE reviewee_id = ${revieweeId}), 0)::int`,
    reviewsCount: sql`(SELECT COUNT(*) FROM reviews WHERE reviewee_id = ${revieweeId})::int`,
  }).where(eq(workerProfiles.userId, revieweeId));
  await notify(db, revieweeId, { title: "New review", body: `${s.name} left you a ${d.rating}-star review.`, link: `/contracts/${c.id}`, email: true });
  return { ok: true };
});
