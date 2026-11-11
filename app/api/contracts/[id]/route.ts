import { z } from "zod";
import { eq } from "drizzle-orm";
import { contracts, invoices } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";

export const PATCH = route<{ id: string }>({ roles: ["employer", "worker", "admin"] }, async (req, { params, session: s, db }) => {
  const { action, reason } = await body(req, z.object({ action: z.enum(["sign", "complete", "terminate"]), reason: z.string().trim().max(1000).optional() }));
  const [c] = await db.select().from(contracts).where(eq(contracts.id, params.id)).limit(1);
  if (!c || (s.role !== "admin" && c.employerId !== s.userId && c.workerId !== s.userId)) throw fail(404, "Contract not found");
  // The consultancy admin acts on behalf of the client (employer side) for complete / terminate, but can't sign for anyone.
  const isAdmin = s.role === "admin";
  if (isAdmin && action === "sign") throw fail(403, "Only the client and the employee can sign");
  const isEmployer = c.employerId === s.userId || isAdmin;
  const other = isEmployer ? c.workerId : c.employerId;
  const link = `/contracts/${c.id}`;

  if (action === "sign") {
    if (c.status !== "pending_signature") throw fail(409, "This contract can no longer be signed");
    const signedByEmployer = c.signedByEmployer || isEmployer, signedByWorker = c.signedByWorker || !isEmployer;
    const active = signedByEmployer && signedByWorker;
    await db.update(contracts).set({ signedByEmployer, signedByWorker, ...(active ? { status: "active" as const, activatedAt: new Date() } : {}) }).where(eq(contracts.id, c.id));
    if (active) {
      const period = c.startDate.slice(0, 7);
      const due = new Date(c.startDate); due.setDate(due.getDate() + 7);
      await db.insert(invoices).values({ number: `INV-${period.replace("-", "")}-${c.id.slice(0, 6).toUpperCase()}`, contractId: c.id, employerId: c.employerId, period, salaryAmount: c.salary, feeAmount: c.serviceFee, total: c.salary + c.serviceFee, dueDate: due.toISOString().slice(0, 10) }).onConflictDoNothing();
      await notify(db, c.employerId, { title: "Contract active", body: `${c.title} is now active. The first invoice has been generated.`, link, email: true });
      await notify(db, c.workerId, { title: "Contract active", body: `${c.title} is now active. Welcome aboard!`, link, email: true });
    } else await notify(db, other, { title: "Contract signed", body: `${s.name} signed ${c.title}. Your signature is needed to activate it.`, link, email: true });
    return { ok: true };
  }
  if (action === "complete") {
    if (!isEmployer || c.status !== "active") throw fail(409, "Only the employer can complete an active contract");
    await db.update(contracts).set({ status: "completed", endedAt: new Date() }).where(eq(contracts.id, c.id));
    await notify(db, c.workerId, { title: "Contract completed", body: `${c.title} was marked completed. You can now leave a review.`, link, email: true });
    return { ok: true };
  }
  if (c.status === "completed" || c.status === "terminated") throw fail(409, "This contract has already ended");
  await db.update(contracts).set({ status: "terminated", endedAt: new Date(), terminationReason: reason || null }).where(eq(contracts.id, c.id));
  await notify(db, other, { title: "Contract terminated", body: `${s.name} ended ${c.title}.${reason ? " Reason: " + reason : ""}`, link, email: true });
  if (isAdmin) await notify(db, c.employerId, { title: "Contract terminated", body: `${s.name} (${s.tenantName}) ended ${c.title}.${reason ? " Reason: " + reason : ""}`, link, email: true });
  return { ok: true };
});
