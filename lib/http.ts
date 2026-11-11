import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSession, getPlatformAdmin, type Session, type PlatformAdmin } from "@/lib/session";
import { withTenant, type Tx } from "@/lib/db";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const fail = (status: number, message: string) => new ApiError(status, message);

type Ctx<P> = { params: Promise<P> };
type Role = Session["role"];

/**
 * Authenticated routes run inside a tenant-scoped transaction (`db`), so row-level security
 * isolates every query to the caller's tenant. The transaction commits only if the handler succeeds.
 */
export function route<P = Record<string, string>>(
  opts: { roles?: Role[] },
  fn: (req: Request, ctx: { params: P; session: Session; db: Tx }) => Promise<unknown>,
) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const session = await getSession();
      if (!session) throw fail(401, "Please sign in to continue");
      if (opts.roles && !opts.roles.includes(session.role)) throw fail(403, "You don't have access to this action");
      const params = (await ctx?.params) as P;
      const out = await withTenant({ tenantId: session.tenantId, userId: session.userId }, (db) => fn(req, { params, session, db }));
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) {
      return errorResponse(e);
    }
  };
}

/** Platform (Super WorkConnect Admin) routes: not tenant-scoped, so they use the unscoped connection on purpose. */
export function platformRoute<P = Record<string, string>>(fn: (req: Request, ctx: { params: P; admin: PlatformAdmin }) => Promise<unknown>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const admin = await getPlatformAdmin();
      if (!admin) throw fail(403, "Platform administrators only");
      const params = (await ctx?.params) as P;
      const out = await fn(req, { params, admin });
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export function errorResponse(e: unknown) {
  if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  console.error("[api]", e);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export async function body<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  let json: unknown;
  try { json = await req.json(); } catch { throw fail(400, "Invalid request body"); }
  return schema.parse(json);
}
