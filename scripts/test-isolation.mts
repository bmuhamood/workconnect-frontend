import { config } from "dotenv"; config({ path: ".env.local" });
import { eq } from "drizzle-orm";
import { rootDb, withTenant } from "../lib/db";
import { tenants, jobs, workerProfiles, users, memberships, notifications, categories } from "../db/schema";

let failed = 0;
const check = (name: string, ok: boolean, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${extra}`); if (!ok) failed++; };

const [A] = await rootDb.select().from(tenants).where(eq(tenants.slug, "kampala-homes"));
const [B] = await rootDb.select().from(tenants).where(eq(tenants.slug, "entebbe-staffing"));
const [adminA] = await rootDb.select().from(users).where(eq(users.email, "admin@kampala-homes.ug"));

const countsA = await withTenant({ tenantId: A.id }, async (tx) => ({ jobs: (await tx.select().from(jobs)).length, workers: (await tx.select().from(workerProfiles)).length, tenants: (await tx.select().from(tenants)).length }));
const countsB = await withTenant({ tenantId: B.id }, async (tx) => ({ jobs: (await tx.select().from(jobs)).length, workers: (await tx.select().from(workerProfiles)).length }));
check("tenant A sees only its own jobs/workers", countsA.jobs === 2 && countsA.workers === 4, JSON.stringify(countsA));
check("tenant B sees only its own jobs/workers", countsB.jobs === 1 && countsB.workers === 2, JSON.stringify(countsB));
check("tenant can only read its own tenant row", countsA.tenants === 1);

// A tenant context cannot read B's rows even by explicit id
const bJob = (await rootDb.select().from(jobs).where(eq(jobs.tenantId, B.id)))[0];
const leak = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(jobs).where(eq(jobs.id, bJob.id)));
check("A cannot read B's job by id", leak.length === 0);

// cannot update/delete another tenant's row
const upd = await withTenant({ tenantId: A.id }, (tx) => tx.update(jobs).set({ title: "hacked" }).where(eq(jobs.id, bJob.id)).returning());
check("A cannot update B's job", upd.length === 0);
const del = await withTenant({ tenantId: A.id }, (tx) => tx.delete(jobs).where(eq(jobs.id, bJob.id)).returning());
check("A cannot delete B's job", del.length === 0);

// cannot insert into another tenant
let blocked = false;
try { await withTenant({ tenantId: A.id }, (tx) => tx.insert(categories).values({ tenantId: B.id, name: "x", slug: "x" })); } catch { blocked = true; }
check("A cannot insert rows for tenant B (WITH CHECK)", blocked);

// inserts default to current tenant automatically
const ins = await withTenant({ tenantId: A.id }, (tx) => tx.insert(notifications).values({ userId: adminA.id, title: "t" }).returning());
check("tenant_id auto-filled from context", ins[0].tenantId === A.id);

// users table: only members of the current tenant are visible, and no password hash/auth id columns
const visibleUsers = await withTenant({ tenantId: B.id }, (tx) => tx.select({ id: users.id, email: users.email }).from(users));
check("B sees only its own members' users", visibleUsers.every((u) => u.email.includes("entebbe")) && visibleUsers.length === 4, `${visibleUsers.length} visible`);
let pwBlocked = false;
try { await withTenant({ tenantId: B.id }, (tx) => tx.select({ h: users.passwordHash }).from(users)); } catch { pwBlocked = true; }
check("tenant role cannot read password hashes", pwBlocked);

// fail-closed: no tenant context -> nothing
const none = await rootDb.transaction(async (tx) => { const { sql } = await import("drizzle-orm"); await tx.execute(sql`set local role wc_app`); return (await tx.select().from(memberships)).length; });
check("no tenant context returns zero rows (fail closed)", none === 0);

// contact inbox is tenant-isolated
const { contactMessages } = await import("../db/schema");
await rootDb.insert(contactMessages).values([{ tenantId: A.id, name: "n", email: "a@a.test", topic: "t", message: "message for A" }, { tenantId: B.id, name: "n", email: "b@b.test", topic: "t", message: "message for B" }]);
const cA = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(contactMessages));
const cB = await withTenant({ tenantId: B.id }, (tx) => tx.select().from(contactMessages));
check("contact inbox: each tenant sees only its own messages", cA.every((m) => m.tenantId === A.id) && cB.every((m) => m.tenantId === B.id) && cA.length >= 1 && cB.length >= 1);
await rootDb.delete(contactMessages).where(eq(contactMessages.topic, "t"));
// HR tables are tenant-isolated too
const { servicePackages, supportTickets } = await import("../db/schema");
await rootDb.insert(servicePackages).values([{ tenantId: A.id, name: "pkg-A", priceText: "x" }, { tenantId: B.id, name: "pkg-B", priceText: "x" }]);
await rootDb.insert(supportTickets).values([{ tenantId: A.id, requesterId: adminA.id, category: "Other", subject: "ticket-A" }, { tenantId: B.id, requesterId: adminA.id, category: "Other", subject: "ticket-B" }]);
const pA = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(servicePackages)), pB = await withTenant({ tenantId: B.id }, (tx) => tx.select().from(servicePackages));
check("packages: each tenant sees only its own", pA.every((p) => p.tenantId === A.id) && pB.every((p) => p.tenantId === B.id) && pA.some((p) => p.name === "pkg-A") && !pA.some((p) => p.name === "pkg-B"));
const tA = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(supportTickets));
check("tickets: tenant A cannot see tenant B's tickets", tA.every((x) => x.tenantId === A.id) && !tA.some((x) => x.subject === "ticket-B"));
let crossIns = false; try { await withTenant({ tenantId: A.id }, (tx) => tx.insert(supportTickets).values({ tenantId: B.id, requesterId: adminA.id, category: "Other", subject: "x" })); } catch { crossIns = true; }
check("tickets: cannot insert into another tenant", crossIns);
await rootDb.delete(servicePackages).where(eq(servicePackages.priceText, "x")); await rootDb.delete(supportTickets).where(eq(supportTickets.category, "Other"));
await rootDb.delete(notifications).where(eq(notifications.title, "t"));
console.log(failed ? `\n${failed} FAILED` : "\nAll isolation checks passed");
process.exit(failed ? 1 : 0);
