import { z } from "zod";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { memberships } from "@/db/schema";
import { readUnsubscribeToken } from "@/lib/email";
import { errorResponse, fail, body } from "@/lib/http";

export async function POST(req: Request) {
  try {
    const { token } = await body(req, z.object({ token: z.string().min(10) }));
    const t = await readUnsubscribeToken(token);
    if (!t) throw fail(400, "This unsubscribe link is invalid or expired");
    await rootDb.update(memberships).set({ marketingOptIn: false }).where(and(eq(memberships.userId, t.userId), eq(memberships.tenantId, t.tenantId)));
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
