// Database-level proof that client workspaces are isolated. Run against a seeded database: npm run db:seed:reset && npm run test:isolation
import { config } from "dotenv"; config({ path: ".env.local" });
import { eq, sql, count, and, isNotNull } from "drizzle-orm";
import { rootDb, withTenant } from "../lib/db";
import * as s from "../db/schema";

let failed = 0;
const check = (name: string, ok: boolean, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${extra}`); if (!ok) failed++; };
const denied = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

const tenants = await rootDb.select().from(s.tenants).orderBy(s.tenants.createdAt);
const withData = [];
for (const t of tenants) { const [c] = await rootDb.select({ n: count() }).from(s.contracts).where(eq(s.contracts.tenantId, t.id)); if (c.n > 0) withData.push(t); }
const [A, B] = withData;
if (!A || !B) throw new Error("Need two client tenants with data. Run: npm run db:seed:reset");
const adminOf = async (tid: string) => (await rootDb.select({ id: s.users.id }).from(s.memberships).innerJoin(s.users, eq(s.users.id, s.memberships.userId)).where(and(eq(s.memberships.tenantId, tid), eq(s.memberships.role, "admin"), eq(s.memberships.isConsultant, false))).limit(1))[0].id;
const adminA = await adminOf(A.id), adminB = await adminOf(B.id);
console.log(`Testing isolation between "${A.name}" and "${B.name}"\n`);

// 1. Every tenant-scoped table: a tenant sees exactly its own rows
const tables = [s.memberships, s.jobs, s.applications, s.contracts, s.invoices, s.workerProfiles, s.employerProfiles, s.leaveRequests, s.attendanceRecords, s.payrollRuns, s.payrollLines, s.supportTickets, s.ticketMessages, s.notifications, s.conversations, s.messages, s.categories, s.reviews] as const;
for (const t of tables) {
  const name = (t as unknown as { [k: symbol]: string })[Symbol.for("drizzle:Name")];
  const expectA = (await rootDb.select({ n: count() }).from(t).where(eq((t as typeof s.jobs).tenantId, A.id)))[0].n;
  const gotA = await withTenant({ tenantId: A.id }, async (tx) => (await tx.select({ n: count() }).from(t))[0].n);
  const gotB = await withTenant({ tenantId: B.id }, async (tx) => (await tx.select().from(t)).every((r) => (r as { tenantId: string }).tenantId === B.id));
  check(`${name}: tenant A sees exactly its ${expectA} rows, tenant B sees only its own`, gotA === expectA && gotB);
}

// 2. Reads, writes and inserts across the boundary
const bJob = (await rootDb.select().from(s.jobs).where(eq(s.jobs.tenantId, B.id)).limit(1))[0];
if (bJob) {
  check("A cannot read B's job by id", (await withTenant({ tenantId: A.id }, (tx) => tx.select().from(s.jobs).where(eq(s.jobs.id, bJob.id)))).length === 0);
  check("A cannot update B's job", (await withTenant({ tenantId: A.id }, (tx) => tx.update(s.jobs).set({ title: "hacked" }).where(eq(s.jobs.id, bJob.id)).returning())).length === 0);
  check("A cannot delete B's job", (await withTenant({ tenantId: A.id }, (tx) => tx.delete(s.jobs).where(eq(s.jobs.id, bJob.id)).returning())).length === 0);
}
check("A cannot insert rows for tenant B (WITH CHECK)", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.insert(s.categories).values({ tenantId: B.id, name: "x", slug: "x-iso" }))));
const ins = await withTenant({ tenantId: A.id }, (tx) => tx.insert(s.notifications).values({ userId: adminA, title: "iso" }).returning());
check("tenant_id is filled from the request context automatically", ins[0].tenantId === A.id);
await rootDb.delete(s.notifications).where(eq(s.notifications.title, "iso"));

// 3. People: a tenant sees only its own members; sensitive columns are unreadable
const usersA = await withTenant({ tenantId: A.id }, (tx) => tx.select({ id: s.users.id }).from(s.users));
const memberIdsA = new Set((await rootDb.select({ u: s.memberships.userId }).from(s.memberships).where(eq(s.memberships.tenantId, A.id))).map((r) => r.u));
check("A can see only people who are members of A", usersA.length === memberIdsA.size && usersA.every((u) => memberIdsA.has(u.id)));
check("tenant role cannot read password hashes", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.select({ h: s.users.passwordHash }).from(s.users))));
check("tenant role cannot read super-admin / consultant flags", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.select({ x: s.users.isSuperAdmin }).from(s.users))));
check("tenant can see only its own tenant row", (await withTenant({ tenantId: A.id }, (tx) => tx.select().from(s.tenants))).length === 1);
check("tenant role cannot modify tenants", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.update(s.tenants).set({ serviceFeeBps: 0 }).where(eq(s.tenants.id, A.id)))));
check("tenant role cannot modify any user", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.update(s.users).set({ isActive: false }).where(eq(s.users.id, adminA)))));

// 4. Invitations are per workspace
await rootDb.insert(s.invitations).values([{ tenantId: A.id, kind: "member", email: "iso-a@test.local", role: "worker", tokenHash: "iso-hash-a", expiresAt: new Date(Date.now() + 1e6) }, { tenantId: B.id, kind: "member", email: "iso-b@test.local", role: "worker", tokenHash: "iso-hash-b", expiresAt: new Date(Date.now() + 1e6) }, { tenantId: null, kind: "staff", email: "iso-staff@test.local", tokenHash: "iso-hash-s", expiresAt: new Date(Date.now() + 1e6) }]);
const invA = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(s.invitations));
check("A sees only its own invitations (not B's, not staff invitations)", invA.some((i) => i.email === "iso-a@test.local") && !invA.some((i) => i.email === "iso-b@test.local" || i.email === "iso-staff@test.local"));
check("A cannot create an invitation into B", await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.insert(s.invitations).values({ tenantId: B.id, kind: "member", email: "x@y.z", role: "admin", tokenHash: "iso-x", expiresAt: new Date() }))));
await rootDb.delete(s.invitations).where(sql`${s.invitations.tokenHash} like 'iso-%'`);

// 5. WorkConnect's own tables are invisible to every client
for (const [name, t] of [["platform_leads", s.platformLeads], ["platform_packages", s.platformPackages], ["audit_log", s.auditLog]] as const)
  check(`${name} cannot be read by a client workspace`, await denied(() => withTenant({ tenantId: A.id }, (tx) => tx.select().from(t))));

// 6. Email: a client sees only its own outbox, never platform emails
await rootDb.insert(s.emailOutbox).values([{ tenantId: null, toEmail: "iso-platform@test.local", template: "iso", subject: "iso", html: "x", text: "x" }, { tenantId: B.id, toEmail: "iso-b@test.local", template: "iso", subject: "iso", html: "x", text: "x" }]);
const outA = await withTenant({ tenantId: A.id }, (tx) => tx.select().from(s.emailOutbox));
check("A's outbox excludes platform emails and B's emails", !outA.some((e) => e.template === "iso") && outA.every((e) => e.tenantId === A.id));
await rootDb.delete(s.emailOutbox).where(eq(s.emailOutbox.template, "iso"));

// 7. Fail closed, and consultant membership is per workspace
check("no tenant context returns zero rows (fail closed)", (await rootDb.transaction(async (tx) => { await tx.execute(sql`set local role wc_app`); return (await tx.select().from(s.memberships)).length; })) === 0);
const cons = await rootDb.select({ t: s.memberships.tenantId }).from(s.memberships).where(and(eq(s.memberships.isConsultant, true), isNotNull(s.memberships.tenantId)));
check("seeded consultants are members of each client workspace (visible to the client)", cons.some((c) => c.t === A.id) && cons.some((c) => c.t === B.id));

console.log(failed ? `\n${failed} FAILED` : "\nAll isolation checks passed");
process.exit(failed ? 1 : 0);
