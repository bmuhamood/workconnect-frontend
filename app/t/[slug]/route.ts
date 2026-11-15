import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { tenants } from "@/db/schema";
import { TENANT_COOKIE } from "@/lib/session";

// Organisation entry link: /t/<slug> selects the tenant for visitors and sign-up.
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [t] = await rootDb.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.slug, slug)).limit(1);
  const res = NextResponse.redirect(new URL(t ? "/" : "/?unknown-organisation=1", req.url));
  if (t) res.cookies.set(TENANT_COOKIE, t.slug, { path: "/", sameSite: "lax", maxAge: 31536000 });
  return res;
}
