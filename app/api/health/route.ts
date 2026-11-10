import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { AUTH_MODE, isProd } from "@/lib/auth-mode";
import { cloudinaryConfig } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/** Setup checker. Reports only booleans/status words — never values or error details. */
export async function GET() {
  const e = process.env;
  const env = {
    DATABASE_URL: !!e.DATABASE_URL,
    NEON_AUTH_BASE_URL: !!e.NEON_AUTH_BASE_URL,
    NEON_AUTH_COOKIE_SECRET_32_chars: (e.NEON_AUTH_COOKIE_SECRET?.length ?? 0) >= 32,
    RESEND_API_KEY: !!e.RESEND_API_KEY,
    EMAIL_FROM: !!e.EMAIL_FROM,
    NEXT_PUBLIC_APP_URL: !!e.NEXT_PUBLIC_APP_URL,
    CRON_SECRET: !!e.CRON_SECRET,
    CLOUDINARY: !!cloudinaryConfig(),
  };
  let database: "ok" | "not_configured" | "unreachable" | "tables_missing_run_db_migrate" | "app_role_missing_run_db_migrate" | "cannot_switch_to_app_role" | "error" = "not_configured";
  let tenants: number | null = null;
  if (env.DATABASE_URL) {
    try {
      await rootDb.execute(sql`select 1`);
      try {
        const t = await rootDb.execute(sql`select count(*)::int as n from tenants`);
        tenants = Number((t.rows?.[0] as { n: number } | undefined)?.n ?? 0);
        const r = await rootDb.execute(sql`select pg_has_role(current_user, 'wc_app', 'member') as ok`);
        if (!(r.rows?.[0] as { ok: boolean } | undefined)?.ok) database = "app_role_missing_run_db_migrate";
        else {
          // The exact step every request performs: switch to the restricted role inside a transaction.
          try { await rootDb.transaction(async (tx) => { await tx.execute(sql`set local role wc_app`); await tx.execute(sql`select count(*) from categories`); }); database = "ok"; }
          catch { database = "cannot_switch_to_app_role"; }
        }
      } catch (err) {
        database = /does not exist/i.test(String((err as Error).message) + String((err as { cause?: Error }).cause?.message)) ? "tables_missing_run_db_migrate" : "error";
      }
    } catch { database = "unreachable"; }
  }
  const authReady = AUTH_MODE === "neon" ? env.NEON_AUTH_COOKIE_SECRET_32_chars : !isProd;
  const ok = database === "ok" && authReady;
  return NextResponse.json({ ok, authMode: AUTH_MODE, authReady, database, tenants, env }, { status: ok ? 200 : 503 });
}
