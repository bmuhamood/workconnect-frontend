import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { jobs } from "@/db/schema";
import { route, body, fail } from "@/lib/http";

const scope = (id: string, s: { role: string; userId: string }) => s.role === "admin" ? eq(jobs.id, id) : and(eq(jobs.id, id), eq(jobs.employerId, s.userId));

export const PATCH = route<{ id: string }>({ roles: ["employer", "admin"] }, async (req, { params, session, db }) => {
  const { status } = await body(req, z.object({ status: z.enum(["open", "filled", "closed"]) }));
  const r = await db.update(jobs).set({ status }).where(scope(params.id, session)).returning({ id: jobs.id });
  if (!r.length) throw fail(404, "Job not found");
  return { ok: true };
});
export const DELETE = route<{ id: string }>({ roles: ["employer", "admin"] }, async (_req, { params, session, db }) => {
  const r = await db.delete(jobs).where(scope(params.id, session)).returning({ id: jobs.id });
  if (!r.length) throw fail(404, "Job not found");
  return { ok: true };
});
