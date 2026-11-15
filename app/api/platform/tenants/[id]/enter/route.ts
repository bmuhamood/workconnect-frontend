import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { rootDb, withTenant } from "@/lib/db";
import { tenants, memberships } from "@/db/schema";
import { staffRoute, fail } from "@/lib/http";
import { TENANT_COOKIE } from "@/lib/session";
import { audit } from "@/lib/audit";

/** A WorkConnect consultant opens a client's workspace to deliver the service. Recorded in the audit log and visible to the client as a consultant member. */
export const POST = staffRoute<{ id: string }>(async (_req, { params, staff }) => {
  const [t] = await rootDb.select().from(tenants).where(and(eq(tenants.id, params.id), isNull(tenants.suspendedAt))).limit(1);
  if (!t) throw fail(404, "Client not found, or it is suspended");
  await withTenant({ tenantId: t.id, userId: staff.userId }, async (tx) => {
    const has = await tx.select({ id: memberships.id }).from(memberships).where(eq(memberships.userId, staff.userId)).limit(1);
    if (!has.length) await tx.insert(memberships).values({ userId: staff.userId, role: "admin", isConsultant: true });
  });
  await audit(staff, "entered_workspace", { tenant: t });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TENANT_COOKIE, t.slug, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 12 });
  return res;
});
