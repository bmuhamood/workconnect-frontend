import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { contracts, applications, jobs, workerProfiles, tenants } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify, serviceFee } from "@/lib/domain";
import { parseWorkDays, hhmmToMinutes } from "@/lib/hr-calc";

const schema = z.object({
  workerId: z.string().uuid(), applicationId: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Enter a job title").max(160), description: z.string().trim().max(3000).default(""),
  salary: z.coerce.number().int().min(1000, "Enter a monthly salary"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a start date"),
  location: z.string().trim().max(200).optional(), hoursPerWeek: z.coerce.number().int().min(1).max(100).default(40),
  workStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a start time").default("08:00"),
  workEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose an end time").default("17:00"),
  workDays: z.string().regex(/^[1-7](,[1-7])*$/, "Choose at least one working day").default("1,2,3,4,5"),
  breakMinutes: z.coerce.number().int().min(0).max(240).default(60),
  lateGraceMinutes: z.coerce.number().int().min(0).max(120).default(15),
  overtimeRate: z.coerce.number().min(1).max(3).default(1.5),
}).refine((d) => hhmmToMinutes(d.workEnd) > hhmmToMinutes(d.workStart) + d.breakMinutes, { message: "Work must end after it starts (allowing for the break)", path: ["workEnd"] });

export const POST = route({ roles: ["employer"] }, async (req, { session, db }) => {
  const d = await body(req, schema);
  const [w] = await db.select({ id: workerProfiles.id }).from(workerProfiles).where(eq(workerProfiles.userId, d.workerId)).limit(1);
  if (!w) throw fail(404, "Worker not found");
  let jobId: string | null = null;
  if (d.applicationId) {
    const [row] = await db.select({ a: applications, j: jobs }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).where(eq(applications.id, d.applicationId)).limit(1);
    if (!row || row.j.employerId !== session.userId || row.a.workerId !== d.workerId) throw fail(403, "Invalid application");
    jobId = row.j.id;
    await db.update(applications).set({ status: "accepted" }).where(eq(applications.id, row.a.id));
    await db.update(applications).set({ status: "rejected" }).where(and(eq(applications.jobId, jobId), eq(applications.status, "pending")));
    await db.update(jobs).set({ status: "filled" }).where(eq(jobs.id, jobId));
  }
  const [t] = await db.select({ bps: tenants.serviceFeeBps }).from(tenants).limit(1);
  const [c] = await db.insert(contracts).values({ employerId: session.userId, workerId: d.workerId, jobId, title: d.title, description: d.description, salary: d.salary, serviceFee: serviceFee(d.salary, t?.bps ?? 1000), startDate: d.startDate, location: d.location || null, hoursPerWeek: d.hoursPerWeek, workStart: d.workStart, workEnd: d.workEnd, workDays: parseWorkDays(d.workDays).join(","), breakMinutes: d.breakMinutes, lateGraceMinutes: d.lateGraceMinutes, overtimeRateBps: Math.round(d.overtimeRate * 10000) }).returning({ id: contracts.id });
  await notify(db, d.workerId, { title: "New contract offer", body: `${session.name} sent you a contract for ${d.title}. Review and sign it to get started.`, link: `/contracts/${c.id}`, email: true });
  return { id: c.id };
});
