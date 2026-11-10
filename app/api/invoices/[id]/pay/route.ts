import { z } from "zod";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import { invoices, users, tenants } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { queueEmail, templates, brandOf, flushOutbox } from "@/lib/email";
import { ugx } from "@/lib/format";

// Records a payment. Plug a real provider (MTN MoMo / Airtel Money / Flutterwave) in here before taking live money.
export const POST = route<{ id: string }>({ roles: ["employer"] }, async (req, { params, session, db }) => {
  const { method } = await body(req, z.object({ method: z.enum(["mtn_momo", "airtel_money", "card", "bank"]) }));
  const [inv] = await db.update(invoices).set({ status: "paid", paidAt: new Date(), paymentMethod: method })
    .where(and(eq(invoices.id, params.id), eq(invoices.employerId, session.userId), eq(invoices.status, "pending"))).returning();
  if (!inv) throw fail(409, "Invoice not found or already paid");
  const [u] = await db.select({ email: users.email, first: users.firstName }).from(users).where(eq(users.id, session.userId)).limit(1);
  const [t] = await db.select().from(tenants).limit(1);
  if (u && t) await queueEmail(db, { email: u.email, name: u.first }, templates.receipt(brandOf(t), { name: u.first, number: inv.number, total: ugx(inv.total), method }), "receipt");
  await notify(db, session.userId, { title: "Payment received", body: `Invoice ${inv.number} was paid.`, link: "/invoices" });
  after(() => flushOutbox(5));
  return { ok: true };
});
