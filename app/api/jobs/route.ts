import { z } from "zod";
import { jobs } from "@/db/schema";
import { route, body } from "@/lib/http";

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(160),
  description: z.string().trim().min(20, "Describe the job in at least 20 characters").max(5000),
  requirements: z.string().trim().max(3000).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  salaryMin: z.coerce.number().int().min(0), salaryMax: z.coerce.number().int().min(0),
  location: z.string().trim().min(2, "Enter a location").max(200), schedule: z.string().trim().max(200).optional(),
}).refine((d) => d.salaryMax >= d.salaryMin, { message: "Maximum salary must be at least the minimum", path: ["salaryMax"] });

export const POST = route({ roles: ["employer", "admin"] }, async (req, { session, db }) => {
  const d = await body(req, schema);
  const [job] = await db.insert(jobs).values({ employerId: session.userId, categoryId: d.categoryId ?? null, title: d.title, description: d.description, requirements: d.requirements || null, salaryMin: d.salaryMin, salaryMax: d.salaryMax, location: d.location, schedule: d.schedule || null }).returning({ id: jobs.id });
  return { id: job.id };
});
