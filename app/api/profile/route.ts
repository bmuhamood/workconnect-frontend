import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users, workerProfiles, employerProfiles } from "@/db/schema";
import { route, body } from "@/lib/http";

const csv = z.string().default("").transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 30));
const names = { firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80) };
const worker = z.object({
  ...names, profession: z.string().trim().max(120).default(""), bio: z.string().trim().max(2000).default(""), city: z.string().trim().min(1).max(80),
  experienceYears: z.coerce.number().int().min(0).max(60).default(0), expectedSalary: z.coerce.number().int().min(0).max(100_000_000).default(0),
  skills: csv, languages: csv, availability: z.enum(["available", "part_time", "busy", "unavailable"]).default("available"),
  categoryId: z.preprocess((v) => (v === "" ? null : v), z.string().uuid().nullable().optional()),
});
const employer = z.object({ ...names, companyName: z.string().trim().max(160).optional(), city: z.string().trim().min(1).max(80), address: z.string().trim().max(300).optional() });
const admin = z.object({ ...names });

export const PATCH = route({}, async (req, { session, db }) => {
  const parse = session.role === "worker" ? worker : session.role === "employer" ? employer : admin;
  const d = (await body(req, parse)) as z.infer<typeof worker> & z.infer<typeof employer>;
  await rootDb.update(users).set({ firstName: d.firstName, lastName: d.lastName }).where(eq(users.id, session.userId));
  if (session.role === "worker")
    await db.update(workerProfiles).set({ profession: d.profession, bio: d.bio, city: d.city, experienceYears: d.experienceYears, expectedSalary: d.expectedSalary, skills: d.skills, languages: d.languages, availability: d.availability, categoryId: d.categoryId ?? null, updatedAt: new Date() }).where(eq(workerProfiles.userId, session.userId));
  if (session.role === "employer")
    await db.update(employerProfiles).set({ companyName: d.companyName || null, city: d.city, address: d.address || null, updatedAt: new Date() }).where(eq(employerProfiles.userId, session.userId));
  return { ok: true };
});
