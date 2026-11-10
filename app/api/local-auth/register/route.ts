import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { AUTH_MODE, assertAuthConfigured } from "@/lib/auth-mode";
import { hashPassword, setLocalSession } from "@/lib/identity";
import { errorResponse, fail, body } from "@/lib/http";
import { NextResponse } from "next/server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z.string().trim().transform((s) => s.replace(/[\s-]/g, "")).refine((s) => /^\+?[0-9]{9,15}$/.test(s), "Enter a valid phone number"),
});

// Local development identity only. In production Neon Auth is used instead.
export async function POST(req: Request) {
  try {
    assertAuthConfigured();
    if (AUTH_MODE !== "local") throw fail(404, "Not available");
    const d = await body(req, schema);
    const [dup] = await rootDb.select({ id: users.id }).from(users).where(eq(users.email, d.email)).limit(1);
    if (dup) throw fail(409, "An account with this email already exists. Try signing in.");
    const [u] = await rootDb.insert(users).values({ authId: crypto.randomUUID(), email: d.email, phone: d.phone, passwordHash: await hashPassword(d.password), firstName: d.firstName, lastName: d.lastName }).returning();
    await setLocalSession({ authId: u.authId, email: u.email, name: `${u.firstName} ${u.lastName}` });
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
