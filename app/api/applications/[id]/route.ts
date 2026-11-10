import { z } from "zod";
import { eq } from "drizzle-orm";
import { applications, jobs } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";

export const PATCH = route<{ id: string }>({ roles: ["employer", "worker", "admin"] }, async (req, { params, session: s, db }) => {
  const { status } = await body(req, z.object({ status: z.enum(["shortlisted", "rejected", "withdrawn"]) }));
  const [row] = await db.select({ a: applications, j: jobs }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).where(eq(applications.id, params.id)).limit(1);
  if (!row) throw fail(404, "Application not found");
  if (s.role === "worker") { if (row.a.workerId !== s.userId || status !== "withdrawn") throw fail(403, "Not allowed"); }
  else if ((s.role === "employer" && row.j.employerId !== s.userId) || status === "withdrawn") throw fail(403, "Not allowed");
  if (row.a.status === "accepted") throw fail(409, "This application was already accepted");
  await db.update(applications).set({ status }).where(eq(applications.id, row.a.id));
  if (s.role !== "worker") await notify(db, row.a.workerId, { title: `Application ${status}`, body: `Your application for ${row.j.title} was ${status}.`, link: "/dashboard", email: true });
  return { ok: true };
});
