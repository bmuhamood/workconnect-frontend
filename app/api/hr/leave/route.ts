import { z } from "zod";
import { and, eq, inArray, lte, gte, sql } from "drizzle-orm";
import { contracts, leaveRequests } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { getTenant } from "@/lib/hr";
import { isRealDate, workingDays, LEAVE_TYPES } from "@/lib/hr-calc";

const schema = z.object({
  contractId: z.string().uuid(), type: z.enum(["annual", "sick", "maternity", "paternity", "compassionate", "unpaid"], { message: "Choose a leave type" }),
  startDate: z.string().refine(isRealDate, "Choose a start date"), endDate: z.string().refine(isRealDate, "Choose an end date"),
  reason: z.string().trim().max(1000).optional(),
});

export const POST = route({ roles: ["worker"] }, async (req, { session, db }) => {
  const d = await body(req, schema);
  if (d.endDate < d.startDate) throw fail(400, "The end date can't be before the start date");
  const [c] = await db.select().from(contracts).where(and(eq(contracts.id, d.contractId), eq(contracts.workerId, session.userId), eq(contracts.status, "active"))).limit(1);
  if (!c) throw fail(404, "You don't have an active contract to request leave on");
  const days = workingDays(d.startDate, d.endDate);
  if (days < 1) throw fail(400, "That range has no working days (weekends don't count)");
  if (days > 120) throw fail(400, "Please request 120 working days or fewer at a time");

  const overlap = await db.select({ id: leaveRequests.id }).from(leaveRequests).where(and(eq(leaveRequests.workerId, session.userId), inArray(leaveRequests.status, ["pending", "approved"]), lte(leaveRequests.startDate, d.endDate), gte(leaveRequests.endDate, d.startDate))).limit(1);
  if (overlap.length) throw fail(409, "You already have leave requested or approved on some of these dates");

  if (d.type !== "unpaid") {
    const t = await getTenant(db);
    const entitled = t.leavePolicy[d.type] ?? 0;
    const year = d.startDate.slice(0, 4);
    const [used] = await db.select({ n: sql<number>`coalesce(sum(days),0)::int` }).from(leaveRequests).where(and(eq(leaveRequests.workerId, session.userId), eq(leaveRequests.type, d.type), inArray(leaveRequests.status, ["pending", "approved"]), sql`extract(year from ${leaveRequests.startDate}) = ${Number(year)}`));
    if (days > entitled - used.n) throw fail(400, `Only ${Math.max(0, entitled - used.n)} day(s) of ${LEAVE_TYPES[d.type].toLowerCase()} left for ${year}. Choose unpaid leave or fewer days.`);
  }
  const [r] = await db.insert(leaveRequests).values({ contractId: c.id, workerId: session.userId, employerId: c.employerId, type: d.type, startDate: d.startDate, endDate: d.endDate, days, reason: d.reason || null }).returning({ id: leaveRequests.id });
  await notify(db, c.employerId, { title: "Leave request", body: `${session.name} requested ${days} day(s) of ${LEAVE_TYPES[d.type].toLowerCase()} (${d.startDate} to ${d.endDate}).`, link: "/hr/leave", email: true });
  return { id: r.id, days };
});
