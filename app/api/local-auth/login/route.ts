import { z } from "zod";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { AUTH_MODE, assertAuthConfigured } from "@/lib/auth-mode";
import { verifyPassword, setLocalSession } from "@/lib/identity";
import { errorResponse, fail, body } from "@/lib/http";

export async function POST(req: Request) {
  try {
    assertAuthConfigured();
    if (AUTH_MODE !== "local") throw fail(404, "Not available");
    const d = await body(req, z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email"), password: z.string().min(1, "Enter your password") }));
    const [u] = await rootDb.select().from(users).where(eq(users.email, d.email)).limit(1);
    if (!u?.passwordHash || !u.isActive || !(await verifyPassword(d.password, u.passwordHash))) throw fail(401, "Incorrect email or password");
    await setLocalSession({ authId: u.authId, email: u.email, name: `${u.firstName} ${u.lastName}` });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
