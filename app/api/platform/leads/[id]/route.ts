import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformLeads } from "@/db/schema";
import { staffRoute, body, fail } from "@/lib/http";

export const PATCH = staffRoute<{ id: string }>(async (req, { params }) => {
  const { status } = await body(req, z.object({ status: z.enum(["new", "contacted", "closed"]) }));
  const r = await rootDb.update(platformLeads).set({ status }).where(eq(platformLeads.id, params.id)).returning({ id: platformLeads.id });
  if (!r.length) throw fail(404, "Enquiry not found");
  return { ok: true };
});
