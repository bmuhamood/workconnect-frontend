import { z } from "zod";
import { eq } from "drizzle-orm";
import { jobs, applications } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";

export const POST = route<{ id: string }>({ roles: ["worker"] }, async (req, { params, session, db }) => {
  const d = await body(req, z.object({ coverLetter: z.string().trim().max(3000).optional(), expectedSalary: z.coerce.number().int().min(0).optional() }));
  const [job] = await db.select().from(jobs).where(eq(jobs.id, params.id)).limit(1);
  if (!job) throw fail(404, "Job not found");
  if (job.status !== "open") throw fail(409, "This job is no longer accepting applications");
  const r = await db.insert(applications).values({ jobId: job.id, workerId: session.userId, coverLetter: d.coverLetter || null, expectedSalary: d.expectedSalary ?? null }).onConflictDoNothing().returning({ id: applications.id });
  if (!r.length) throw fail(409, "You have already applied to this job");
  await notify(db, job.employerId, { title: "New application", body: `${session.name} applied for ${job.title}.`, link: `/jobs/${job.id}`, email: true });
  return { ok: true };
});
