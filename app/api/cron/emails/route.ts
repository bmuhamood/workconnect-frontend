import { NextResponse } from "next/server";
import { and, eq, lt, sql } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { applications, contracts, invoices, jobs, followups, users, tenants } from "@/db/schema";
import { flushOutbox, queueEmail, templates, brandOf, appUrl } from "@/lib/email";
import { notify } from "@/lib/domain";
import { ugx } from "@/lib/format";

/** Vercel Cron: retries queued emails and sends follow-ups. Protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = { applications: 0, contracts: 0, invoices: 0 };
  for (const t of await rootDb.select().from(tenants)) {
    await withTenant({ tenantId: t.id }, async (tx) => {
      const once = async (kind: string, entityId: string) =>
        (await tx.insert(followups).values({ kind, entityId }).onConflictDoNothing().returning({ id: followups.id })).length > 0;
      const days = (n: number) => sql`now() - interval '${sql.raw(String(n))} days'`;
      // Employers: applications waiting 3+ days
      for (const r of await tx.select({ a: applications.id, title: jobs.title, emp: jobs.employerId, jobId: jobs.id }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).where(and(eq(applications.status, "pending"), lt(applications.createdAt, days(3)))))
        if (await once("application_pending", r.a)) { stats.applications++; await notify(tx, r.emp, { title: `Applicants waiting: ${r.title}`, body: "You have applications that haven't been reviewed yet. Candidates move fast — shortlist or reply today.", link: `/jobs/${r.jobId}`, email: true, followUp: true }); }
      // Contracts unsigned 2+ days
      for (const c of await tx.select().from(contracts).where(and(eq(contracts.status, "pending_signature"), lt(contracts.createdAt, days(2)))))
        if (await once("contract_unsigned", c.id)) {
          stats.contracts++;
          for (const uid of [c.signedByEmployer ? null : c.employerId, c.signedByWorker ? null : c.workerId].filter(Boolean) as string[])
            await notify(tx, uid, { title: `Signature needed: ${c.title}`, body: "This contract is waiting for your signature.", link: `/contracts/${c.id}`, email: true, followUp: true });
        }
      // Invoices due within 3 days or overdue
      for (const i of await tx.select().from(invoices).where(and(eq(invoices.status, "pending"), lt(invoices.dueDate, sql`(current_date + 3)`))))
        if (await once("invoice_reminder", i.id)) {
          stats.invoices++;
          const [u] = await tx.select({ email: users.email, first: users.firstName }).from(users).where(eq(users.id, i.employerId)).limit(1);
          if (u) await queueEmail(tx, { email: u.email, name: u.first }, templates.invoice(brandOf(t), { name: u.first, number: i.number, total: ugx(i.total), due: i.dueDate, url: appUrl() + "/invoices", reminder: true }), "invoice_reminder");
        }
    });
  }
  return NextResponse.json({ ...stats, ...(await flushOutbox(100)) });
}
