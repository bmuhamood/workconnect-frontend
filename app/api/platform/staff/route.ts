import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { platformRoute, body, fail } from "@/lib/http";
import { issueStaffInvite } from "@/lib/invite-actions";
import { audit } from "@/lib/audit";
import { emailRe } from "@/lib/invitations";

/** Invite a WorkConnect consultant. */
export const POST = platformRoute(async (req, { admin }) => {
  const d = await body(req, z.object({ email: z.string().trim().toLowerCase().refine((s) => emailRe.test(s), "Enter a valid email"), firstName: z.string().trim().max(80).optional() }));
  const [ex] = await rootDb.select().from(users).where(eq(users.email, d.email)).limit(1);
  if (ex?.isConsultant || ex?.isSuperAdmin) throw fail(409, "That person is already WorkConnect staff");
  const inv = await issueStaffInvite({ email: d.email, firstName: d.firstName, inviter: { id: admin.userId, name: admin.name } });
  await audit(admin, "consultant_invited", { detail: d.email });
  return { inviteUrl: inv.url };
});
