// Local/demo data: two independent tenants. Demo users sign in with local dev auth (not Neon Auth).
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as s from "./schema";
import { DEFAULT_CATEGORIES, DEFAULT_PACKAGES } from "../lib/domain-constants";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema: s });

type W = [string, string, string, string, string, number, number, string[], number, number];
const DATA = [
  { name: "Kampala Homes", slug: "kampala-homes", color: "#4f46e5", domain: "kh", workers: [
    ["Sarah", "Namukasa", "Nanny", "childcare", "Kampala", 6, 450000, ["Childcare", "First aid", "Cooking"], 480, 12],
    ["John", "Okello", "Professional Driver", "drivers", "Entebbe", 9, 700000, ["Defensive driving", "Class B licence"], 470, 8],
    ["Mary", "Atim", "Cook", "cooks", "Kampala", 5, 500000, ["Ugandan cuisine", "Baking"], 490, 15],
    ["Peter", "Ssemanda", "Security Guard", "security", "Wakiso", 4, 400000, ["CCTV", "Patrol"], 450, 6],
  ] as W[], jobs: [
    ["childcare", "Live-out nanny for two toddlers", "Looking for a caring, experienced nanny to look after two toddlers on weekdays. Light meal preparation included.", 400000, 550000, "Kololo, Kampala"],
    ["drivers", "Family driver (Class B)", "Experienced driver needed for school runs and family errands. Clean licence and good knowledge of Kampala roads required.", 600000, 800000, "Muyenga, Kampala"],
  ] },
  { name: "Entebbe Staffing", slug: "entebbe-staffing", color: "#059669", domain: "es", workers: [
    ["Esther", "Nabirye", "House Manager", "house-help", "Entebbe", 8, 600000, ["Housekeeping", "Laundry"], 480, 10],
    ["David", "Mugisha", "Gardener", "gardeners", "Mukono", 7, 350000, ["Landscaping", "Irrigation"], 460, 5],
  ] as W[], jobs: [["cleaners", "Weekly deep-cleaning team lead", "Lead a small cleaning crew for lakeside homes. Reliable transport and prior supervisory experience preferred.", 500000, 650000, "Entebbe"]] },
];

async function main() {
  if ((await db.select().from(s.tenants).limit(1)).length) { console.log("Already seeded"); return; }
  const pw = await bcrypt.hash("Password123!", 10);
  let n = 0;
  const mkUser = async (email: string, first: string, last: string) =>
    (await db.insert(s.users).values({ authId: crypto.randomUUID(), email, phone: `+2567000${String(1000 + n++)}`, passwordHash: pw, firstName: first, lastName: last }).returning())[0];

  for (const T of DATA) {
    const [t] = await db.insert(s.tenants).values({ name: T.name, slug: T.slug, brandColor: T.color }).returning();
    const cats = await db.insert(s.categories).values(DEFAULT_CATEGORIES.map(([name, slug, icon]) => ({ tenantId: t.id, name, slug, icon }))).returning();
    await db.insert(s.servicePackages).values(DEFAULT_PACKAGES.map((p, i) => ({ tenantId: t.id, ...p, features: [...p.features], sortOrder: i })));
    const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;
    const admin = await mkUser(`admin@${T.slug}.ug`, "Admin", T.name.split(" ")[0]);
    await db.insert(s.memberships).values({ tenantId: t.id, userId: admin.id, role: "admin" });
    const emp = await mkUser(`employer@${T.slug}.ug`, "Grace", "Nakato");
    await db.insert(s.memberships).values({ tenantId: t.id, userId: emp.id, role: "employer" });
    await db.insert(s.employerProfiles).values({ tenantId: t.id, userId: emp.id, companyName: `${T.name} Client`, city: "Kampala" });
    for (const [i, w] of T.workers.entries()) {
      const u = await mkUser(`worker${i + 1}@${T.slug}.ug`, w[0], w[1]);
      await db.insert(s.memberships).values({ tenantId: t.id, userId: u.id, role: "worker" });
      await db.insert(s.workerProfiles).values({ tenantId: t.id, userId: u.id, profession: w[2], categoryId: cat(w[3]), city: w[4], experienceYears: w[5], expectedSalary: w[6], skills: w[7], languages: ["English", "Luganda"], verified: i % 3 !== 2, ratingAvg: w[8], reviewsCount: w[9], bio: `${w[2]} with ${w[5]} years of experience serving families in ${w[4]}. Reliable, punctual and trained.` });
    }
    await db.insert(s.jobs).values(T.jobs.map(([c, title, description, min, max, location]) => ({ tenantId: t.id, employerId: emp.id, categoryId: cat(c as string), title: title as string, description: description as string, salaryMin: min as number, salaryMax: max as number, location: location as string, schedule: "Mon–Fri" })));
  }
  console.log("Seeded 2 tenants. Local logins (password Password123!): admin@kampala-homes.ug, employer@kampala-homes.ug, worker1@kampala-homes.ug, admin@entebbe-staffing.ug");
}
main().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
