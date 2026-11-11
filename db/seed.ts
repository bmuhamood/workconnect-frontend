// Complete demo data for the whole system. Run:  npm run db:seed:reset   (wipes everything, then seeds)
// Everything is generated relative to "today" in Africa/Kampala, so attendance, leave, payroll, invoices and
// notifications always look current. Demo users sign in with password Password123! (see lib/demo-accounts.ts).
import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as s from "./schema";
import { DEFAULT_CATEGORIES, DEFAULT_PACKAGES } from "../lib/domain-constants";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../lib/demo-accounts";
import { templates } from "../lib/email/templates";
import { localParts, zonedToUtc, dayMetrics, isWorkDay, workingDays, workingDaysWithin, monthRange, computeLine, parseBands, overtimePayFor, hhmmToMinutes, type Schedule } from "../lib/hr-calc";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema: s });

// ---------------------------------------------------------------- time + randomness
const TZ = "Africa/Kampala";
const now = new Date();
const today = localParts(now, TZ).ymd;
const DAY = 86_400_000;
const addDays = (ymd: string, n: number) => new Date(Date.parse(ymd + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);
const monthBack = (back: number) => { const [y, m] = today.split("-").map(Number); return new Date(Date.UTC(y, m - 1 - back, 1)).toISOString().slice(0, 7); };
const at = (ymd: string, hhmm: string) => zonedToUtc(ymd, hhmm, TZ);
const ago = (hours: number) => new Date(now.getTime() - hours * 3_600_000);
const hh = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
let seedState = 20261111;
const rnd = () => { seedState = (seedState + 0x6d2b79f5) | 0; let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const between = (a: number, b: number) => Math.floor(a + rnd() * (b - a + 1));
const M1 = monthBack(1), M2 = monthBack(2), M3 = monthBack(3), CUR = monthBack(0);

const SCHED = (o: Partial<Schedule> = {}): Schedule => ({ workStart: "08:00", workEnd: "17:00", workDays: "1,2,3,4,5", breakMinutes: 60, lateGraceMinutes: 15, overtimeRateBps: 15000, ...o });

// ---------------------------------------------------------------- definitions
type ClientDef = { key: string; first: string; last: string; company: string; city: string; address: string };
type WorkerDef = { key: string; first: string; last: string; profession: string; cat: string; city: string; exp: number; expected: number; skills: string[]; verified: boolean; rating: number; reviews: number; avail?: "available" | "part_time" | "busy" | "unavailable" };
type ContractDef = { worker: string; client: string; title: string; salary: number; startedAgo: number; status: "active" | "pending_signature" | "completed" | "terminated"; sched: Schedule; location: string; hours: number; duties: string; endedAgo?: number; reason?: string; allowance?: number; advanceM2?: number; job?: string };
type LeaveDef = { w: string; type: string; a: number; b: number; status: "approved" | "pending" | "rejected" | "cancelled"; reason: string; note?: string };
type JobDef = { client: string; cat: string; title: string; description: string; min: number; max: number; location: string; schedule: string; status: "open" | "filled" | "closed"; ageDays: number; apps?: { w: string; status: "pending" | "shortlisted" | "accepted" | "rejected" | "withdrawn"; cover: string; salary: number }[] };
type Chat = { a: string; b: string; msgs: [string, string, number][]; unread?: number };
type TicketDef = { by: string; category: string; subject: string; status: "open" | "in_progress" | "resolved"; thread: [string, string, number][] };

type TenantDef = {
  name: string; slug: string; color: string; confirmedRates: boolean;
  contactEmail: string; contactPhone: string; contactAddress: string;
  owners: { key: string; first: string; last: string; email: string }[];
  clients: ClientDef[]; workers: WorkerDef[]; contracts: ContractDef[]; leave: LeaveDef[]; jobs: JobDef[]; chats: Chat[]; tickets: TicketDef[];
  payrollMonths: { period: string; status: "draft" | "approved" | "paid" }[];
  overdueFor?: string; contacts: { name: string; email: string; topic: string; message: string; ago: number }[];
};

const WORK_CONNECT: TenantDef = {
  name: "Work Connect UG Ltd", slug: "work-connect-ug", color: "#3042d6", confirmedRates: true,
  contactEmail: "info@workconnect.ug", contactPhone: "+256700100200", contactAddress: "Plot 12, Kampala Road, Kampala, Uganda",
  owners: [{ key: "owner", first: "Daniel", last: "Mwesigwa", email: "owner@workconnect.ug" }, { key: "hr", first: "Rebecca", last: "Auma", email: "hr@workconnect.ug" }],
  clients: [
    { key: "client1", first: "Grace", last: "Nakato", company: "Nakato Family Household", city: "Kampala", address: "Kololo, Kampala" },
    { key: "client2", first: "Robert", last: "Kiggundu", company: "Kiggundu Logistics Ltd", city: "Kampala", address: "Industrial Area, Kampala" },
    { key: "client3", first: "Aisha", last: "Namutebi", company: "Lakeview Dental Clinic", city: "Entebbe", address: "Airport Road, Entebbe" },
  ],
  workers: [
    { key: "worker1", first: "Sarah", last: "Namukasa", profession: "Professional Nanny", cat: "childcare", city: "Kampala", exp: 6, expected: 450000, skills: ["Childcare", "First aid", "Cooking"], verified: true, rating: 480, reviews: 12 },
    { key: "worker2", first: "John", last: "Okello", profession: "Professional Driver", cat: "drivers", city: "Entebbe", exp: 9, expected: 700000, skills: ["Defensive driving", "Class B licence", "Vehicle maintenance"], verified: true, rating: 470, reviews: 8 },
    { key: "worker3", first: "Mary", last: "Atim", profession: "Cook", cat: "cooks", city: "Kampala", exp: 5, expected: 500000, skills: ["Ugandan cuisine", "Baking", "Menu planning"], verified: true, rating: 490, reviews: 15 },
    { key: "worker4", first: "Peter", last: "Ssemanda", profession: "Security Guard", cat: "security", city: "Wakiso", exp: 4, expected: 400000, skills: ["CCTV", "Patrol", "Access control"], verified: true, rating: 450, reviews: 6 },
    { key: "worker5", first: "Brian", last: "Mukasa", profession: "Warehouse Supervisor", cat: "manufacturing", city: "Kampala", exp: 7, expected: 900000, skills: ["Inventory", "Forklift", "Team leadership"], verified: true, rating: 460, reviews: 5 },
    { key: "worker6", first: "Joan", last: "Nabukenya", profession: "Accounts Assistant", cat: "it-professional", city: "Kampala", exp: 6, expected: 1200000, skills: ["QuickBooks", "Payroll", "Reconciliation"], verified: true, rating: 485, reviews: 4 },
    { key: "worker7", first: "Lydia", last: "Nansubuga", profession: "Professional Cleaner", cat: "cleaners", city: "Mukono", exp: 3, expected: 350000, skills: ["Deep cleaning", "Laundry"], verified: false, rating: 0, reviews: 0 },
    { key: "worker8", first: "Moses", last: "Ochieng", profession: "Gardener", cat: "gardeners", city: "Wakiso", exp: 8, expected: 380000, skills: ["Landscaping", "Irrigation"], verified: true, rating: 430, reviews: 3, avail: "available" },
    { key: "worker9", first: "Betty", last: "Namaganda", profession: "House Help", cat: "house-help", city: "Kampala", exp: 4, expected: 320000, skills: ["Housekeeping", "Laundry", "Ironing"], verified: true, rating: 500, reviews: 7 },
    { key: "worker10", first: "Agnes", last: "Tendo", profession: "Receptionist", cat: "retail", city: "Entebbe", exp: 2, expected: 600000, skills: ["Front desk", "Customer service", "MS Office"], verified: false, rating: 0, reviews: 0, avail: "available" },
  ],
  contracts: [
    { worker: "worker1", client: "client1", title: "Live-out nanny", salary: 450000, startedAgo: 150, status: "active", sched: SCHED({ workStart: "07:30", workEnd: "16:30", workDays: "1,2,3,4,5,6", lateGraceMinutes: 10 }), location: "Kololo, Kampala", hours: 48, duties: "Care for two toddlers, light meal preparation, school-run support. Saturday half-days included.", job: "Live-out nanny for two toddlers" },
    { worker: "worker2", client: "client1", title: "Family driver", salary: 700000, startedAgo: 200, status: "active", sched: SCHED({ workStart: "07:00", workEnd: "17:00" }), location: "Muyenga, Kampala", hours: 45, duties: "School runs, family errands and airport transfers. Keep the vehicle clean and serviced.", allowance: 50000, job: "Family driver (Class B)" },
    { worker: "worker3", client: "client1", title: "Household cook", salary: 500000, startedAgo: 120, status: "active", sched: SCHED({ workStart: "09:00", workEnd: "18:00" }), location: "Kololo, Kampala", hours: 40, duties: "Plan menus, shop, cook lunch and dinner, keep the kitchen hygienic." },
    { worker: "worker8", client: "client1", title: "Gardener", salary: 380000, startedAgo: 170, status: "terminated", endedAgo: 40, reason: "The client is relocating abroad and the position is no longer required.", sched: SCHED({ workStart: "07:30", workEnd: "15:30", workDays: "1,2,3,4,5" }), location: "Kololo, Kampala", hours: 35, duties: "Lawn, hedges, flower beds and irrigation." },
    { worker: "worker7", client: "client1", title: "Part-time cleaner", salary: 350000, startedAgo: -7, status: "pending_signature", sched: SCHED({ workStart: "08:00", workEnd: "14:00", workDays: "1,3,5", breakMinutes: 30 }), location: "Kololo, Kampala", hours: 18, duties: "Deep cleaning three days a week." },
    { worker: "worker4", client: "client2", title: "Security guard (day shift)", salary: 400000, startedAgo: 180, status: "active", sched: SCHED({ workStart: "06:00", workEnd: "18:00", workDays: "1,2,3,4,5,6", overtimeRateBps: 20000 }), location: "Industrial Area, Kampala", hours: 60, duties: "Gate control, patrols, visitor log, incident reporting.", advanceM2: 30000 },
    { worker: "worker5", client: "client2", title: "Warehouse supervisor", salary: 900000, startedAgo: 100, status: "active", sched: SCHED(), location: "Industrial Area, Kampala", hours: 40, duties: "Receiving, dispatch, stock counts and supervising six loaders." },
    { worker: "worker6", client: "client2", title: "Accounts assistant", salary: 1200000, startedAgo: 90, status: "active", sched: SCHED({ workStart: "08:30", workEnd: "17:30", lateGraceMinutes: 10 }), location: "Industrial Area, Kampala", hours: 40, duties: "Bookkeeping, payables, reconciliations and month-end support." },
    { worker: "worker9", client: "client2", title: "Office house-keeper", salary: 320000, startedAgo: 200, status: "completed", endedAgo: 60, sched: SCHED({ workStart: "07:00", workEnd: "15:00" }), location: "Industrial Area, Kampala", hours: 40, duties: "Daily cleaning of offices and kitchenette." },
  ],
  leave: [
    { w: "worker1", type: "annual", a: -62, b: -58, status: "approved", reason: "Family wedding in Gulu", note: "Approved. Enjoy!" },
    { w: "worker1", type: "compassionate", a: -100, b: -99, status: "cancelled", reason: "Funeral (arrangements changed)" },
    { w: "worker2", type: "sick", a: -20, b: -19, status: "approved", reason: "Malaria, with clinic note" },
    { w: "worker3", type: "annual", a: 14, b: 18, status: "pending", reason: "Visiting my parents in Mbarara" },
    { w: "worker4", type: "unpaid", a: -999, b: -999, status: "approved", reason: "Personal matter at home", note: "Approved as unpaid leave" },
    { w: "worker5", type: "annual", a: 3, b: 5, status: "rejected", reason: "Short break", note: "Stock-take week. Please choose other dates." },
    { w: "worker6", type: "annual", a: 30, b: 37, status: "approved", reason: "Annual holiday" },
    { w: "worker6", type: "sick", a: 2, b: 2, status: "pending", reason: "Dental appointment" },
    { w: "worker8", type: "annual", a: -120, b: -116, status: "approved", reason: "Rest" },
  ],
  jobs: [
    { client: "client1", cat: "childcare", title: "Live-out nanny for two toddlers", description: "Caring, experienced nanny for two toddlers on weekdays. Light meal preparation included.", min: 400000, max: 550000, location: "Kololo, Kampala", schedule: "Mon–Sat, 07:30–16:30", status: "filled", ageDays: 170, apps: [{ w: "worker1", status: "accepted", cover: "I have six years of nanny experience and first-aid training.", salary: 450000 }] },
    { client: "client1", cat: "drivers", title: "Family driver (Class B)", description: "Experienced driver for school runs and errands. Clean licence and good knowledge of Kampala roads required.", min: 600000, max: 800000, location: "Muyenga, Kampala", schedule: "Mon–Fri, 07:00–17:00", status: "filled", ageDays: 215, apps: [{ w: "worker2", status: "accepted", cover: "Nine years driving families and executives, defensive-driving certified.", salary: 700000 }] },
    { client: "client1", cat: "cleaners", title: "Part-time cleaner (3 days a week)", description: "Deep cleaning of a family home on Monday, Wednesday and Friday.", min: 300000, max: 400000, location: "Kololo, Kampala", schedule: "Mon, Wed, Fri, 08:00–14:00", status: "filled", ageDays: 20, apps: [{ w: "worker7", status: "accepted", cover: "Reliable and thorough, references available.", salary: 350000 }, { w: "worker10", status: "rejected", cover: "I can also do cleaning while I look for front-desk work.", salary: 330000 }] },
    { client: "client2", cat: "security", title: "Security guard, day shift", description: "Gate control and patrols at a logistics yard. Experience with CCTV an advantage.", min: 380000, max: 450000, location: "Industrial Area, Kampala", schedule: "Mon–Sat, 06:00–18:00", status: "filled", ageDays: 190, apps: [{ w: "worker4", status: "accepted", cover: "Four years guarding commercial premises.", salary: 400000 }] },
    { client: "client2", cat: "manufacturing", title: "Forklift operator", description: "Certified forklift operator for loading and stacking. Will train on our WMS.", min: 700000, max: 900000, location: "Industrial Area, Kampala", schedule: "Mon–Fri, 08:00–17:00", status: "open", ageDays: 5, apps: [{ w: "worker5", status: "shortlisted", cover: "Certified operator with seven years in warehousing.", salary: 850000 }, { w: "worker8", status: "withdrawn", cover: "Interested but I have accepted another role.", salary: 700000 }] },
    { client: "client3", cat: "retail", title: "Dental clinic receptionist", description: "Friendly receptionist to manage bookings, billing and patient records. Good computer skills needed.", min: 550000, max: 750000, location: "Airport Road, Entebbe", schedule: "Mon–Fri, 08:00–17:00", status: "open", ageDays: 6, apps: [{ w: "worker10", status: "shortlisted", cover: "Two years at a busy clinic front desk, strong MS Office skills.", salary: 600000 }, { w: "worker9", status: "pending", cover: "I would like to move into reception work.", salary: 500000 }] },
    { client: "client3", cat: "caregivers", title: "Dental assistant (trainee)", description: "Support the dentist with chair-side preparation and sterilisation. Training provided.", min: 500000, max: 650000, location: "Airport Road, Entebbe", schedule: "Mon–Sat, 08:00–16:00", status: "open", ageDays: 3, apps: [{ w: "worker10", status: "pending", cover: "Keen to train as a dental assistant.", salary: 520000 }] },
    { client: "client3", cat: "cleaners", title: "Clinic cleaner (evenings)", description: "Evening cleaning and sanitising of a dental clinic.", min: 250000, max: 330000, location: "Airport Road, Entebbe", schedule: "Mon–Fri, 17:00–20:00", status: "closed", ageDays: 45 },
  ],
  chats: [
    { a: "owner", b: "client1", msgs: [["owner", "Good morning Grace, your nanny and cook are settled. Please tell us if anything needs adjusting.", 300], ["client1", "Thank you Daniel. Sarah is wonderful. Can we add Saturday half-days to her schedule?", 299], ["owner", "Done. It is already in her contract, and overtime applies beyond 16:30.", 298]] },
    { a: "client1", b: "worker1", msgs: [["client1", "Hi Sarah, I'll be home late on Thursday. Could you stay until 18:00?", 30], ["worker1", "Of course, Madam Grace. I'll clock out at 18:00 so it's recorded as overtime.", 29], ["client1", "Perfect, I'll approve it.", 28]], unread: 0 },
    { a: "client2", b: "worker4", msgs: [["client2", "Peter, please send me the incident report for the gate last night.", 52], ["worker4", "Sent to your email, sir. Nothing was stolen.", 50]], unread: 1 },
    { a: "hr", b: "worker3", msgs: [["worker3", "Good afternoon. I applied for leave from the 14th. Has it gone to Mr Kiggundu?", 20], ["hr", "Hello Mary. It's with your client, Madam Grace, for approval. I've reminded her.", 19]], unread: 0 },
    { a: "client3", b: "worker10", msgs: [["client3", "Hello Agnes, we reviewed your application for receptionist. Can you attend an interview on Friday at 10:00?", 10], ["worker10", "Yes, I'll be there. Thank you!", 8]], unread: 1 },
  ],
  tickets: [
    { by: "worker2", category: "Payroll", subject: "My transport allowance is missing from my payslip", status: "resolved", thread: [["worker2", "My payslip shows no transport allowance this month.", 400], ["owner", "Thanks John. The allowance was entered after the run was generated. We recalculated and your payslip is updated.", 390], ["worker2", "Received. Thank you.", 388]] },
    { by: "worker4", category: "Leave", subject: "How much unpaid leave was deducted?", status: "in_progress", thread: [["worker4", "Can you show how my unpaid leave was calculated?", 60], ["hr", "Basic divided by 22 working days, multiplied by your approved unpaid days. I'll send the breakdown.", 40]] },
    { by: "worker1", category: "Attendance", subject: "Overtime on Thursday not showing as approved", status: "open", thread: [["worker1", "I stayed until 18:00 on Thursday but overtime still shows pending.", 6]] },
    { by: "client2", category: "Contract", subject: "Can we extend Brian's contract hours?", status: "open", thread: [["client2", "We want Brian on a longer Saturday shift for peak season. What is the process?", 14]] },
    { by: "worker6", category: "Policy question", subject: "NSSF contribution rate", status: "resolved", thread: [["worker6", "Which NSSF rate is applied to my pay?", 500], ["owner", "5% employee and 10% employer, shown on every payslip. Rates are confirmed by the admin each time.", 490]] },
  ],
  payrollMonths: [{ period: M3, status: "paid" }, { period: M2, status: "approved" }, { period: M1, status: "draft" }],
  overdueFor: "worker4",
  contacts: [
    { name: "Hellen Achieng", email: "hellen@sunrisehotel.ug", topic: "Book a consultation", message: "We run a 40-room hotel in Jinja and need housekeepers and waiters for peak season. Can we meet this week?", ago: 30 },
    { name: "Samuel Tumwine", email: "samuel@kampalaschools.ug", topic: "Package enquiry", message: "Please share pricing for Workforce Management for a school with 35 support staff.", ago: 70 },
    { name: "Dr. Irene Kyomuhendo", email: "irene@lakehospital.ug", topic: "I want to hire staff", message: "Looking for six patient-support personnel on contract.", ago: 120 },
    { name: "Patrick Odongo", email: "podongo@example.com", topic: "Partnership", message: "We are a labour export agency and would like to discuss collaboration.", ago: 200 },
  ],
};

const GLOBIS: TenantDef = {
  name: "GLOBIS HR Solutions Ltd", slug: "globis-hr", color: "#047857", confirmedRates: false,
  contactEmail: "hello@globis.ug", contactPhone: "+256700300400", contactAddress: "Circular Road, Entebbe, Uganda",
  owners: [{ key: "owner", first: "Patricia", last: "Nabwire", email: "owner@globis.ug" }],
  clients: [
    { key: "client1", first: "Daniel", last: "Opio", company: "Lakeside Guest House", city: "Entebbe", address: "Lakeview Road, Entebbe" },
    { key: "client2", first: "Prossy", last: "Achieng", company: "Entebbe Fresh Produce", city: "Entebbe", address: "Kitoro, Entebbe" },
  ],
  workers: [
    { key: "worker1", first: "Esther", last: "Nabirye", profession: "House Manager", cat: "house-help", city: "Entebbe", exp: 8, expected: 600000, skills: ["Housekeeping", "Laundry", "Staff supervision"], verified: true, rating: 480, reviews: 10 },
    { key: "worker2", first: "David", last: "Mugisha", profession: "Gardener", cat: "gardeners", city: "Mukono", exp: 7, expected: 350000, skills: ["Landscaping", "Irrigation"], verified: true, rating: 460, reviews: 5 },
    { key: "worker3", first: "Samuel", last: "Kato", profession: "Delivery Driver", cat: "drivers", city: "Entebbe", exp: 5, expected: 650000, skills: ["Class C licence", "Route planning"], verified: true, rating: 440, reviews: 4 },
    { key: "worker4", first: "Winnie", last: "Nakimera", profession: "Chef", cat: "hospitality", city: "Entebbe", exp: 6, expected: 700000, skills: ["Continental cuisine", "Pastry", "Food safety"], verified: true, rating: 490, reviews: 9 },
    { key: "worker5", first: "Patrick", last: "Ouma", profession: "Security Guard", cat: "security", city: "Entebbe", exp: 3, expected: 380000, skills: ["Patrol", "Access control"], verified: false, rating: 0, reviews: 0 },
    { key: "worker6", first: "Ruth", last: "Nalwoga", profession: "Housekeeper", cat: "hospitality", city: "Mukono", exp: 2, expected: 330000, skills: ["Room turnaround", "Laundry"], verified: false, rating: 0, reviews: 0, avail: "available" },
  ],
  contracts: [
    { worker: "worker1", client: "client1", title: "Guest house manager", salary: 600000, startedAgo: 130, status: "active", sched: SCHED({ workStart: "07:00", workEnd: "16:00" }), location: "Lakeview Road, Entebbe", hours: 45, duties: "Run housekeeping, supervise two cleaners, manage linen and stock." },
    { worker: "worker2", client: "client1", title: "Grounds keeper", salary: 350000, startedAgo: 110, status: "active", sched: SCHED({ workStart: "07:30", workEnd: "15:30" }), location: "Lakeview Road, Entebbe", hours: 40, duties: "Lawns, hedges, flower beds and irrigation." },
    { worker: "worker4", client: "client1", title: "Head cook", salary: 700000, startedAgo: 95, status: "active", sched: SCHED({ workStart: "06:00", workEnd: "15:00", workDays: "1,2,3,4,5,6", overtimeRateBps: 17500 }), location: "Lakeview Road, Entebbe", hours: 54, duties: "Breakfast and lunch service for up to 30 guests." },
    { worker: "worker3", client: "client2", title: "Delivery driver", salary: 650000, startedAgo: 85, status: "active", sched: SCHED({ workStart: "07:00", workEnd: "17:00", workDays: "1,2,3,4,5,6" }), location: "Kitoro, Entebbe", hours: 50, duties: "Daily produce deliveries to hotels and supermarkets." },
    { worker: "worker5", client: "client2", title: "Night-to-day security guard", salary: 380000, startedAgo: 60, status: "active", sched: SCHED({ workStart: "06:00", workEnd: "18:00", workDays: "1,2,3,4,5,6,7", overtimeRateBps: 20000 }), location: "Kitoro, Entebbe", hours: 72, duties: "Guard the cold-storage yard and log deliveries." },
  ],
  leave: [
    { w: "worker1", type: "annual", a: 10, b: 14, status: "pending", reason: "Family visit" },
    { w: "worker2", type: "sick", a: -9, b: -8, status: "approved", reason: "Flu" },
    { w: "worker3", type: "annual", a: -40, b: -38, status: "approved", reason: "Personal" },
  ],
  jobs: [
    { client: "client1", cat: "hospitality", title: "Housekeeper (guest rooms)", description: "Room turnaround and laundry for a 12-room guest house.", min: 300000, max: 400000, location: "Entebbe", schedule: "Mon–Sat, 07:00–15:00", status: "open", ageDays: 7, apps: [{ w: "worker6", status: "shortlisted", cover: "Two years in guest-room housekeeping.", salary: 330000 }] },
    { client: "client2", cat: "drivers", title: "Delivery driver", description: "Daily produce deliveries around Entebbe and Kampala.", min: 600000, max: 700000, location: "Kitoro, Entebbe", schedule: "Mon–Sat", status: "filled", ageDays: 90, apps: [{ w: "worker3", status: "accepted", cover: "Class C licence, five years' experience.", salary: 650000 }] },
  ],
  chats: [
    { a: "owner", b: "client1", msgs: [["owner", "Welcome to GLOBIS HR Solutions. Your three team members are now on payroll.", 200], ["client1", "Thank you. Esther has already improved our turnaround times.", 190]], unread: 0 },
    { a: "client2", b: "worker3", msgs: [["client2", "Samuel, tomorrow's first delivery is at 06:30.", 18], ["worker3", "Understood, I'll be at the yard by 06:15.", 17]], unread: 1 },
  ],
  tickets: [
    { by: "worker4", category: "Payroll", subject: "When is overtime paid?", status: "open", thread: [["worker4", "Is approved overtime paid in the same month?", 12]] },
  ],
  payrollMonths: [{ period: M1, status: "draft" }],
  contacts: [{ name: "Josephine Namara", email: "jnamara@bayview.ug", topic: "I want to hire staff", message: "We need three waiters and two kitchen assistants for a lakeside restaurant.", ago: 48 }],
};

// ---------------------------------------------------------------- generic helpers
type Row<T> = T extends { $inferInsert: infer I } ? I : never;
type Ids = Record<string, string>;

async function seedTenant(T: TenantDef, hash: string, auth: { n: number }) {
  const mkUser = async (email: string, first: string, last: string, createdDaysAgo = 200) => {
    const [u] = await db.insert(s.users).values({ authId: crypto.randomUUID(), email, phone: `+25670${String(1000000 + auth.n++)}`, passwordHash: hash, firstName: first, lastName: last, createdAt: ago(createdDaysAgo * 24) }).returning();
    return u;
  };
  const [t] = await db.insert(s.tenants).values({ name: T.name, slug: T.slug, brandColor: T.color, contactEmail: T.contactEmail, contactPhone: T.contactPhone, contactAddress: T.contactAddress, emailFromName: T.name, payrollRatesConfirmedAt: T.confirmedRates ? ago(24 * 90) : null, createdAt: ago(24 * 260) }).returning();
  const tid = t.id;
  const cfg = { bands: parseBands(t.payeBands), nssfEmployeeBps: t.nssfEmployeeBps, nssfEmployerBps: t.nssfEmployerBps, nssfCap: t.nssfCap };

  const cats = await db.insert(s.categories).values(DEFAULT_CATEGORIES.map(([name, slug, icon]) => ({ tenantId: tid, name, slug, icon }))).returning();
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!.id;
  await db.insert(s.servicePackages).values([
    ...DEFAULT_PACKAGES.map((p, i) => ({ tenantId: tid, ...p, features: [...p.features], sortOrder: i })),
    { tenantId: tid, name: "Temporary & Casual Staffing", tagline: "Short-term cover for peaks and events.", priceText: "From UGX 25,000 per person per day", billingNote: "Minimum order applies", features: ["Rapid shortlist within 48 hours", "Pre-screened casual pool", "Daily attendance reports"], highlighted: false, sortOrder: 3, active: false },
  ]);

  // ---- people
  const U: Ids = {};
  for (const o of T.owners) { const u = await mkUser(o.email, o.first, o.last, 250); U[o.key] = u.id; await db.insert(s.memberships).values({ tenantId: tid, userId: u.id, role: "admin" }); }
  const domain = T.owners[0].email.split("@")[1];
  for (const c of T.clients) {
    const u = await mkUser(`${c.key}@${domain}`, c.first, c.last, 220); U[c.key] = u.id;
    await db.insert(s.memberships).values({ tenantId: tid, userId: u.id, role: "employer" });
    await db.insert(s.employerProfiles).values({ tenantId: tid, userId: u.id, companyName: c.company, city: c.city, address: c.address });
  }
  for (const w of T.workers) {
    const u = await mkUser(`${w.key}@${domain}`, w.first, w.last, 180); U[w.key] = u.id;
    await db.insert(s.memberships).values({ tenantId: tid, userId: u.id, role: "worker" });
    await db.insert(s.workerProfiles).values({ tenantId: tid, userId: u.id, profession: w.profession, categoryId: cat(w.cat), city: w.city, experienceYears: w.exp, expectedSalary: w.expected, skills: w.skills, languages: ["English", "Luganda", ...(rnd() > 0.5 ? ["Swahili"] : [])], verified: w.verified, ratingAvg: w.rating, reviewsCount: w.reviews, availability: w.avail ?? "available", nationalId: w.verified ? `CM${between(10000000, 99999999)}ABCD` : null, bio: `${w.profession} with ${w.exp} years of experience serving clients in ${w.city}. Reliable, punctual and workplace-trained by ${T.name}.` });
  }

  // ---- jobs + applications
  const jobIds: Record<string, string> = {};
  for (const j of T.jobs) {
    const [row] = await db.insert(s.jobs).values({ tenantId: tid, employerId: U[j.client], categoryId: cat(j.cat), title: j.title, description: j.description, requirements: "Valid ID, two references, and willingness to complete workplace-readiness training.", salaryMin: j.min, salaryMax: j.max, location: j.location, schedule: j.schedule, status: j.status, createdAt: ago(j.ageDays * 24) }).returning();
    jobIds[j.title] = row.id;
    for (const a of j.apps ?? []) await db.insert(s.applications).values({ tenantId: tid, jobId: row.id, workerId: U[a.w], coverLetter: a.cover, expectedSalary: a.salary, status: a.status, createdAt: ago((j.ageDays - 1) * 24) });
  }

  // ---- contracts
  type C = { id: string; def: ContractDef; workerId: string; employerId: string; startDate: string; endDate: string | null; activated: boolean };
  const contracts: C[] = [];
  for (const d of T.contracts) {
    const startDate = addDays(today, -d.startedAgo);
    const endDate = d.endedAgo !== undefined ? addDays(today, -d.endedAgo) : null;
    const active = d.status !== "pending_signature";
    const [row] = await db.insert(s.contracts).values({
      tenantId: tid, employerId: U[d.client], workerId: U[d.worker], jobId: d.job ? jobIds[d.job] ?? null : null, title: d.title, description: d.duties, salary: d.salary, serviceFee: Math.round(d.salary * t.serviceFeeBps / 10000), startDate, location: d.location, hoursPerWeek: d.hours,
      workStart: d.sched.workStart, workEnd: d.sched.workEnd, workDays: d.sched.workDays, breakMinutes: d.sched.breakMinutes, lateGraceMinutes: d.sched.lateGraceMinutes, overtimeRateBps: d.sched.overtimeRateBps,
      status: d.status, signedByEmployer: true, signedByWorker: active, terminationReason: d.status === "terminated" ? d.reason ?? null : null,
      createdAt: d.status === "pending_signature" ? ago(48) : ago((d.startedAgo + 6) * 24), activatedAt: active ? at(startDate, "08:00") : null, endedAt: endDate ? at(endDate, "17:00") : null,
    }).returning();
    contracts.push({ id: row.id, def: d, workerId: U[d.worker], employerId: U[d.client], startDate, endDate, activated: active });
  }
  const byWorker = (w: string) => contracts.find((c) => c.def.worker === w)!;

  // ---- leave
  const leaveDays = new Map<string, Set<string>>(); // workerKey -> approved leave dates (no attendance on these)
  const unpaid: { w: string; from: string; to: string }[] = [];
  for (const l of T.leave) {
    const c = byWorker(l.w);
    let from = addDays(today, l.a), to = addDays(today, l.b);
    if (l.a === -999) { from = `${M1}-12`; to = `${M1}-16`; } // unpaid leave inside last month so payroll shows a deduction
    const days = workingDays(from, to);
    if (days < 1) continue;
    await db.insert(s.leaveRequests).values({ tenantId: tid, contractId: c.id, workerId: c.workerId, employerId: c.employerId, type: l.type, startDate: from, endDate: to, days, reason: l.reason, status: l.status, decidedBy: l.status === "approved" || l.status === "rejected" ? c.employerId : null, decidedAt: l.status === "approved" || l.status === "rejected" ? at(addDays(from, -3), "10:00") : null, decisionNote: l.note ?? null, createdAt: at(addDays(from, -10), "09:30") });
    if (l.status === "approved") {
      const set = leaveDays.get(l.w) ?? new Set<string>();
      for (let d = from; d <= to; d = addDays(d, 1)) set.add(d);
      leaveDays.set(l.w, set);
      if (l.type === "unpaid") unpaid.push({ w: l.w, from, to });
    }
  }

  // ---- attendance (from the start of M-3 so payroll history has real overtime)
  type Att = { contract: C; date: string; ot: number; otStatus: string };
  const att: Att[] = [];
  const attRows: Row<typeof s.attendanceRecords>[] = [];
  const histFrom = `${M3}-01`;
  for (const c of contracts) {
    if (!c.activated) continue;
    const sc = c.def.sched, last = c.endDate && c.endDate < today ? c.endDate : today;
    const start = hhmmToMinutes(sc.workStart), end = hhmmToMinutes(sc.workEnd);
    for (let d = c.startDate > histFrom ? c.startDate : histFrom; d <= last; d = addDays(d, 1)) {
      if (leaveDays.get(c.def.worker)?.has(d)) continue;
      const working = isWorkDay(d, sc.workDays), isToday = d === today;
      let inMin: number, outMin: number | null;
      if (!working) { if (isToday || rnd() > 0.03) continue; inMin = 9 * 60 + between(0, 30); outMin = inMin + between(180, 270); }
      else {
        if (!isToday && rnd() < 0.04) continue; // absent
        inMin = rnd() < 0.13 ? start + sc.lateGraceMinutes + between(3, 50) : start + between(-10, sc.lateGraceMinutes);
        outMin = end + (rnd() < 0.22 ? between(20, 150) : between(-6, 12));
      }
      const inAt = at(d, hh(inMin)); if (inAt > now) continue;
      let outAt: Date | null = at(d, hh(Math.min(outMin, 23 * 60 + 59))); if (outAt > now) outAt = null;
      const m = dayMetrics(sc, TZ, d, inAt, outAt);
      const age = daysBetween(d, today);
      const otStatus = m.overtimeMinutes === 0 ? "none" : age <= 14 ? (rnd() < 0.6 ? "pending" : "approved") : rnd() < 0.9 ? "approved" : "rejected";
      const manual = rnd() < 0.05 && outAt !== null;
      attRows.push({ tenantId: tid, contractId: c.id, workerId: c.workerId, workDate: d, clockIn: inAt, clockOut: outAt, status: m.status, lateMinutes: m.lateMinutes, overtimeMinutes: m.overtimeMinutes, overtimeStatus: otStatus, overtimeDecidedBy: otStatus === "approved" || otStatus === "rejected" ? c.employerId : null, overtimeDecidedAt: otStatus === "approved" || otStatus === "rejected" ? at(addDays(d, 1), "10:00") : null, source: manual ? "manual" : "self", note: manual ? "Corrected by client: employee forgot to clock out" : null });
      att.push({ contract: c, date: d, ot: m.overtimeMinutes, otStatus });
    }
  }
  for (let i = 0; i < attRows.length; i += 200) await db.insert(s.attendanceRecords).values(attRows.slice(i, i + 200));

  // ---- payroll
  const payRows: { period: string; status: string }[] = T.payrollMonths;
  for (const pm of payRows) {
    const { from, to } = monthRange(pm.period);
    const approvedAt = at(addDays(`${pm.period}-28`, 5), "09:00");
    const [run] = await db.insert(s.payrollRuns).values({ tenantId: tid, period: pm.period, status: pm.status, createdBy: U.owner, approvedAt: pm.status === "draft" ? null : approvedAt, paidAt: pm.status === "paid" ? addHours(approvedAt, 72) : null, createdAt: addHours(approvedAt, -48) }).returning();
    for (const c of contracts) {
      if (!c.activated || c.startDate > to || (c.endDate && c.endDate < from)) continue;
      const unpaidDays = unpaid.filter((u) => u.w === c.def.worker).reduce((n, u) => n + workingDaysWithin(u.from, u.to, from, to), 0);
      const otMin = att.filter((a) => a.contract === c && a.otStatus === "approved" && a.date >= from && a.date <= to).reduce((n, a) => n + a.ot, 0);
      const otPay = overtimePayFor(otMin, c.def.salary, c.def.sched);
      const allowances = c.def.allowance ?? 0, other = pm.period === M2 ? c.def.advanceM2 ?? 0 : 0;
      const r = computeLine({ basic: c.def.salary, allowances, otherDeductions: other, unpaidDays, overtimePay: otPay }, cfg);
      await db.insert(s.payrollLines).values({ tenantId: tid, runId: run.id, contractId: c.id, workerId: c.workerId, employerId: c.employerId, basic: c.def.salary, allowances, unpaidDays, unpaidDeduction: r.unpaidDeduction, overtimeMinutes: otMin, overtimePay: otPay, otherDeductions: other, gross: r.gross, nssfEmployee: r.nssfEmployee, paye: r.paye, netPay: r.netPay, nssfEmployer: r.nssfEmployer });
      if (pm.status !== "draft") await db.insert(s.notifications).values({ tenantId: tid, userId: c.workerId, title: `Payslip ready: ${pm.period}`, body: `Your payslip for ${pm.period} is ready to view.`, link: "/hr/payroll", readAt: pm.period === M2 ? null : addHours(approvedAt, 5), createdAt: approvedAt });
    }
  }

  // ---- invoices
  const methods = ["mtn_momo", "airtel_money", "card", "bank"];
  let mi = 0;
  for (const c of contracts) {
    if (!c.activated) continue;
    const endPeriod = (c.endDate ?? today).slice(0, 7);
    for (let p = c.startDate.slice(0, 7); p <= endPeriod; p = (() => { const [y, m] = p.split("-").map(Number); return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7); })()) {
      const overdue = p === M1 && T.overdueFor === c.def.worker;
      const status = p === CUR ? "pending" : overdue ? "overdue" : "paid";
      const fee = Math.round(c.def.salary * t.serviceFeeBps / 10000);
      await db.insert(s.invoices).values({ tenantId: tid, number: `INV-${p.replace("-", "")}-${c.id.slice(0, 6).toUpperCase()}`, contractId: c.id, employerId: c.employerId, period: p, salaryAmount: c.def.salary, feeAmount: fee, total: c.def.salary + fee, status, dueDate: p === CUR ? `${p}-25` : `${p}-07`, paidAt: status === "paid" ? at(`${p}-05`, "11:00") : null, paymentMethod: status === "paid" ? methods[mi++ % 4] : null, createdAt: at(`${p}-01`, "06:00") });
    }
  }

  // ---- reviews (completed + some ended/active contracts)
  const rev = async (c: C, byEmployer: boolean, rating: number, comment: string, daysAfterEnd: number) =>
    db.insert(s.reviews).values({ tenantId: tid, contractId: c.id, reviewerId: byEmployer ? c.employerId : c.workerId, revieweeId: byEmployer ? c.workerId : c.employerId, rating, comment, createdAt: at(addDays(c.endDate ?? today, daysAfterEnd), "12:00") });
  for (const c of contracts) {
    if (c.def.status === "completed") { await rev(c, true, 5, "Reliable, tidy and always on time. We would hire again.", 1); await rev(c, false, 5, "A respectful household that paid on time and treated me well.", 2); }
    if (c.def.status === "terminated") await rev(c, true, 4, "Hardworking gardener. We are relocating, which is the only reason for ending the contract.", 1);
  }

  // ---- conversations
  for (const ch of T.chats) {
    const [x, y] = U[ch.a] < U[ch.b] ? [U[ch.a], U[ch.b]] : [U[ch.b], U[ch.a]];
    const last = ch.msgs[ch.msgs.length - 1];
    const [conv] = await db.insert(s.conversations).values({ tenantId: tid, userA: x, userB: y, lastMessageAt: ago(last[2]), createdAt: ago(ch.msgs[0][2]) }).returning();
    const unreadFrom = ch.msgs.length - (ch.unread ?? 0);
    for (const [i, [who, text, hoursAgo]] of ch.msgs.entries()) await db.insert(s.messages).values({ tenantId: tid, conversationId: conv.id, senderId: U[who], body: text, readAt: i >= unreadFrom ? null : ago(hoursAgo - 0.2), createdAt: ago(hoursAgo) });
  }

  // ---- support tickets
  for (const k of T.tickets) {
    const first = k.thread[0], lastMsg = k.thread[k.thread.length - 1];
    const [tk] = await db.insert(s.supportTickets).values({ tenantId: tid, requesterId: U[k.by], category: k.category, subject: k.subject, status: k.status, createdAt: ago(first[2]), updatedAt: ago(lastMsg[2]) }).returning();
    for (const [who, body, h] of k.thread) await db.insert(s.ticketMessages).values({ tenantId: tid, ticketId: tk.id, authorId: U[who], body, createdAt: ago(h) });
  }

  // ---- contact-form inbox
  for (const m of T.contacts) await db.insert(s.contactMessages).values({ tenantId: tid, name: m.name, email: m.email, topic: m.topic, message: m.message, createdAt: ago(m.ago) });

  // ---- notifications: every kind of event, mix of read/unread
  const N: Omit<Row<typeof s.notifications>, "tenantId">[] = [];
  const note = (user: string, title: string, body: string, link: string, hoursAgo: number, read: boolean) => N.push({ userId: user, title, body, link, readAt: read ? ago(hoursAgo - 1) : null, createdAt: ago(hoursAgo) });
  for (const c of contracts) {
    const w = c.workerId, e = c.employerId, name = `${T.workers.find((x) => x.key === c.def.worker)!.first}`;
    if (c.def.status === "pending_signature") { note(w, "New contract offer", `${T.clients.find((x) => x.key === c.def.client)!.first} sent you a contract for ${c.def.title}. Review and sign it to get started.`, `/contracts/${c.id}`, 40, false); note(e, "Contract awaiting signature", `${name} has not signed ${c.def.title} yet.`, `/contracts/${c.id}`, 20, false); continue; }
    note(w, "Contract active", `${c.def.title} is now active. Welcome aboard!`, `/contracts/${c.id}`, c.def.startedAgo * 24, true);
    note(e, "Contract active", `${c.def.title} is now active. The first invoice has been generated.`, `/contracts/${c.id}`, c.def.startedAgo * 24, true);
    if (c.def.status === "terminated") { note(w, "Contract terminated", `${c.def.title} was ended. Reason: ${c.def.reason}`, `/contracts/${c.id}`, (c.def.endedAgo ?? 0) * 24, true); note(U.owner, "Contract terminated", `${name}'s contract (${c.def.title}) was ended by the client.`, `/contracts/${c.id}`, (c.def.endedAgo ?? 0) * 24, true); }
    if (c.def.status === "completed") note(w, "Contract completed", `${c.def.title} was marked completed. You can now leave a review.`, `/contracts/${c.id}`, (c.def.endedAgo ?? 0) * 24, true);
  }
  for (const a of att.filter((x) => x.otStatus === "pending").slice(0, 60)) note(a.contract.employerId, "Overtime to approve", `${T.workers.find((x) => x.key === a.contract.def.worker)!.first} worked ${Math.floor(a.ot / 60)}h ${String(a.ot % 60).padStart(2, "0")}m of overtime on ${a.date}.`, "/hr/attendance", Math.max(2, daysBetween(a.date, today) * 24 - 8), false);
  for (const a of att.filter((x) => x.otStatus === "approved" && daysBetween(x.date, today) < 20).slice(0, 25)) note(a.contract.workerId, "Overtime approved", `Your overtime on ${a.date} was approved and will be paid with that month's salary.`, "/hr/attendance", daysBetween(a.date, today) * 24 - 14, daysBetween(a.date, today) > 5);
  for (const l of T.leave) {
    const c = byWorker(l.w), nm = T.workers.find((x) => x.key === l.w)!.first;
    if (l.status === "pending") note(c.employerId, "Leave request", `${nm} requested ${l.type} leave. Review it in HR Operations.`, "/hr/leave", 30, false);
    if (l.status === "approved") note(c.workerId, "Leave approved", `Your ${l.type} leave was approved.`, "/hr/leave", 24 * 40, true);
    if (l.status === "rejected") note(c.workerId, "Leave not approved", `Your ${l.type} leave request was not approved. ${l.note ?? ""}`, "/hr/leave", 24 * 3, false);
  }
  const lateRows = att.filter((a) => daysBetween(a.date, today) <= 3);
  for (const a of lateRows.slice(0, 8)) if (rnd() < 0.5) note(a.contract.employerId, "Late clock-in", `${T.workers.find((x) => x.key === a.contract.def.worker)!.first} clocked in after the ${a.contract.def.sched.workStart} start time.`, `/hr/employees/${a.contract.id}`, daysBetween(a.date, today) * 24 + 2, true);
  for (const c of contracts) if (c.activated && c.def.status === "active") { note(c.employerId, `Invoice due: ${CUR}`, `Your invoice for ${CUR} is ready. Pay by ${CUR}-25 to avoid reminders.`, "/invoices", 24 * 10, false); }
  for (const k of T.tickets) { const req = U[k.by]; const last = k.thread[k.thread.length - 1]; if (k.status === "open") for (const o of T.owners) note(U[o.key], `New HR request: ${k.subject}`, `${k.category} request awaiting a reply.`, "/hr/support", last[2], false); else note(req, `HR request ${k.status === "resolved" ? "resolved" : "updated"}: ${k.subject}`, "Open the helpdesk to read the reply.", "/hr/support", last[2], true); }
  for (const j of T.jobs) for (const a of j.apps ?? []) { note(U[j.client], "New application", `${T.workers.find((x) => x.key === a.w)!.first} applied for ${j.title}.`, `/jobs/${jobIds[j.title]}`, j.ageDays * 24 - 20, a.status !== "pending"); if (a.status !== "pending" && a.status !== "withdrawn") note(U[a.w], `Application ${a.status}`, `Your application for ${j.title} was ${a.status}.`, "/dashboard", j.ageDays * 24 - 40, true); }
  for (const m of T.contacts.slice(0, 2)) note(U.owner, "New enquiry", `${m.name}: ${m.topic}`, "/admin", m.ago, m.ago > 100);
  for (const ch of T.chats) if (ch.unread) { const last = ch.msgs[ch.msgs.length - 1]; const to = last[0] === ch.a ? ch.b : ch.a; note(U[to], "New message", last[1].slice(0, 80), "/messages", last[2], false); }
  for (const u of Object.values(U)) note(u, `Welcome to ${T.name}`, "Your account is ready. Complete your profile and explore your dashboard.", "/dashboard", 24 * 120, true);
  for (let i = 0; i < N.length; i += 200) await db.insert(s.notifications).values(N.slice(i, i + 200).map((n) => ({ ...n, tenantId: tid })));

  // ---- email outbox (history only: nothing is queued, so no real email is sent by seeding)
  const brand = { name: T.name, color: T.color };
  const mails: Row<typeof s.emailOutbox>[] = [];
  const mail = (to: string, name: string, title: string, body: string, status: "sent" | "failed" | "skipped", hoursAgo: number, template = "notice") => {
    const r = templates.notice(brand, { title, body: `Hi ${name},\n\n${body}` });
    mails.push({ tenantId: tid, toEmail: to, toName: name, template, subject: r.subject, html: r.html, text: r.text, status, attempts: status === "failed" ? 5 : 1, error: status === "failed" ? "Seeded example: mailbox unavailable" : null, providerId: status === "sent" ? `seed_${mails.length}` : null, createdAt: ago(hoursAgo), sentAt: status === "sent" ? ago(hoursAgo - 0.05) : null });
  };
  for (const c of contracts) { const w = T.workers.find((x) => x.key === c.def.worker)!; if (c.activated) mail(`${c.def.worker}@${domain}`, w.first, "Contract active", `${c.def.title} is now active. Welcome aboard!`, "sent", c.def.startedAgo * 24, "notice"); }
  mail(`worker7@${domain}`, "Lydia", "New contract offer", "You have a new contract offer. Review and sign it to get started.", domain === "workconnect.ug" ? "sent" : "skipped", 40);
  mail(`client2@${domain}`, "Robert", "Invoice reminder", `Your invoice for ${M1} is overdue.`, "failed", 30, "followup");
  mail(`owner@${domain}`, T.owners[0].first, "New HR request", "A new HR support request needs a reply.", "sent", 6);
  if (mails.length) await db.insert(s.emailOutbox).values(mails);

  // ---- follow-ups already sent (so the daily cron doesn't resend them)
  const fu = contracts.filter((c) => c.def.status === "active").slice(0, 3).map((c) => ({ tenantId: tid, kind: "invoice_reminder", entityId: c.id }));
  if (fu.length) await db.insert(s.followups).values(fu);

  return { tenant: t, users: Object.keys(U).length, contracts: contracts.length, attendance: attRows.length, notes: N.length };
}
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000);

async function main() {
  const reset = process.argv.includes("--reset");
  if ((await db.select({ id: s.tenants.id }).from(s.tenants).limit(1)).length || (await db.select({ id: s.users.id }).from(s.users).limit(1)).length) {
    if (!reset) { console.log("The database already has data. Run `npm run db:seed:reset` to wipe it and load the demo data."); return; }
    await db.execute(sql`TRUNCATE TABLE tenants, users RESTART IDENTITY CASCADE`);
    console.log("Existing data wiped.");
  }
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const auth = { n: 0 };
  // Platform owner (not tied to any organisation)
  await db.insert(s.users).values({ authId: crypto.randomUUID(), email: "superadmin@workconnect.ug", phone: "+256700000001", passwordHash: hash, firstName: "Super", lastName: "Admin", isSuperAdmin: true, createdAt: ago(24 * 300) });
  const results = [];
  for (const T of [WORK_CONNECT, GLOBIS]) results.push(await seedTenant(T, hash, auth));

  // Every advertised demo login must exist.
  const emails = new Set((await db.select({ e: s.users.email }).from(s.users)).map((r) => r.e));
  const missing = DEMO_ACCOUNTS.filter((a) => !emails.has(a.email));
  if (missing.length) throw new Error("Demo accounts missing from seed: " + missing.map((m) => m.email).join(", "));

  console.log(`\nSeeded ${results.length} HR consultancies + the platform admin (today = ${today}, ${TZ}).`);
  for (const r of results) console.log(`  • ${r.tenant.name}: ${r.users} users, ${r.contracts} contracts, ${r.attendance} attendance days, ${r.notes} notifications`);
  console.log(`\nPassword for every account: ${DEMO_PASSWORD}\n`);
  for (const a of DEMO_ACCOUNTS) console.log(`  ${a.email.padEnd(30)} ${a.label}`);
}
main().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
