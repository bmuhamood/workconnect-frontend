import { z } from "zod";
import { eq } from "drizzle-orm";
import { leaveRequests } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { notify } from "@/lib/domain";
import { getTenant } from "@/lib/hr";
import { localParts, LEAVE_TYPES } from "@/lib/hr-calc";

export const PATCH = route<{ id: string }>({}, async (req, { params, session: s, db }) => {
  const { action, note } = await body(req, z.object({ action: z.enum(["approve", "reject", "cancel"]), note: z.string().trim().max(500).optional() }));
  const [r] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, params.id)).limit(1);
  if (!r || (s.role === "worker" && r.workerId !== s.userId) || (s.role === "employer" && r.employerId !== s.userId)) throw fail(404, "Leave request not found");
  const label = `${LEAVE_TYPES[r.type]?.toLowerCase() ?? r.type} (${r.startDate} to ${r.endDate})`;
  if (action === "cancel") {
    if (r.workerId !== s.userId) throw fail(403, "Only the employee can cancel their request");
    const today = localParts(new Date(), (await getTenant(db)).timezone).ymd;
    if (r.status === "pending" || (r.status === "approved" && r.startDate > today)) {
      await db.update(leaveRequests).set({ status: "cancelled" }).where(eq(leaveRequests.id, r.id));
      await notify(db, r.employerId, { title: "Leave cancelled", body: `${s.name} cancelled ${label}.`, link: "/hr/leave" });
      return { ok: true };
    }
    throw fail(409, "This request can no longer be cancelled");
  }
  if (s.role === "worker") throw fail(403, "Only a manager can decide leave requests");
  if (r.status !== "pending") throw fail(409, `This request was already ${r.status}`);
  const status = action === "approve" ? "approved" : "rejected";
  await db.update(leaveRequests).set({ status, decidedBy: s.userId, decidedAt: new Date(), decisionNote: note || null }).where(eq(leaveRequests.id, r.id));
  await notify(db, r.workerId, { title: `Leave ${status}`, body: `Your ${label} was ${status}.${note ? " Note: " + note : ""}`, link: "/hr/leave", email: true });
  return { ok: true };
});
