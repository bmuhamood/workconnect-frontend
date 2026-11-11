import { z } from "zod";
import { supportTickets, ticketMessages } from "@/db/schema";
import { route, body } from "@/lib/http";
import { notifyAdmins } from "@/lib/domain";

export const TICKET_CATEGORIES = ["Payroll", "Leave", "Contract", "Attendance", "Policy question", "Other"] as const;
export const POST = route({}, async (req, { session, db }) => {
  const d = await body(req, z.object({ category: z.enum(TICKET_CATEGORIES, { message: "Choose a category" }), subject: z.string().trim().min(3, "Add a short subject").max(150), message: z.string().trim().min(5, "Describe your request").max(4000) }));
  const [t] = await db.insert(supportTickets).values({ requesterId: session.userId, category: d.category, subject: d.subject }).returning({ id: supportTickets.id });
  await db.insert(ticketMessages).values({ ticketId: t.id, authorId: session.userId, body: d.message });
  await notifyAdmins(db, { title: `New HR request: ${d.subject}`, body: `${session.name} (${d.category}): ${d.message.slice(0, 120)}`, link: `/hr/support/${t.id}`, email: true });
  return { id: t.id };
});
