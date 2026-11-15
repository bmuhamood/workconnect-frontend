import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { getIdentity } from "@/lib/identity";
import { errorResponse, fail, body } from "@/lib/http";
import { audit } from "@/lib/audit";

const same = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
/** One-time bootstrap of the first Super WorkConnect Admin. Needs PLATFORM_SETUP_TOKEN and only works while no Super Admin exists. */
export async function POST(req: Request) {
  try {
    const expected = process.env.PLATFORM_SETUP_TOKEN;
    if (!expected || expected.length < 16) throw fail(404, "Setup is not enabled");
    const id = await getIdentity();
    if (!id) throw fail(401, "Create your account first");
    const d = await body(req, z.object({ token: z.string(), firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), phone: z.string().trim().transform((s) => s.replace(/[\s-]/g, "")).refine((s) => /^\+?[0-9]{9,15}$/.test(s), "Enter a valid phone number") }));
    if (!same(d.token, expected)) throw fail(403, "That setup token is not correct");
    if ((await rootDb.select({ id: users.id }).from(users).where(eq(users.isSuperAdmin, true)).limit(1)).length) throw fail(409, "A Super Admin already exists. Setup is closed.");
    let [u] = await rootDb.select().from(users).where(eq(users.authId, id.authId)).limit(1);
    if (!u) [u] = await rootDb.insert(users).values({ authId: id.authId, email: id.email, phone: d.phone, firstName: d.firstName, lastName: d.lastName, isSuperAdmin: true }).returning();
    else await rootDb.update(users).set({ isSuperAdmin: true, firstName: d.firstName, lastName: d.lastName, phone: d.phone }).where(eq(users.id, u.id));
    await audit({ userId: u.id, name: `${d.firstName} ${d.lastName}` }, "super_admin_created", { detail: id.email });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
