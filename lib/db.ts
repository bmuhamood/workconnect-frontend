import "server-only";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "@/db/schema";

const isNeon = (u: string) => /neon\.tech|neon\.build/.test(u);

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (isNeon(url)) {
    neonConfig.webSocketConstructor = ws; // needed on Node runtimes for interactive transactions
    return drizzleNeon(new NeonPool({ connectionString: url, max: 5 }), { schema });
  }
  return drizzlePg(new PgPool({ connectionString: url, max: 5 }), { schema });
}

type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
const g = globalThis as unknown as { __db?: Db };

/** Unscoped connection (owner role). Use ONLY for identity/tenant lookups and onboarding. */
export const rootDb: Db = new Proxy({} as Db, {
  get(_t, prop) {
    g.__db ??= createDb();
    return Reflect.get(g.__db, prop);
  },
});

/**
 * Runs `fn` in a transaction as the non-privileged `wc_app` role with the tenant context set.
 * Postgres row-level security then guarantees every query only sees this tenant's rows.
 */
export async function withTenant<T>(ctx: { tenantId: string; userId?: string }, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return rootDb.transaction(async (tx) => {
    await tx.execute(sql`set local role wc_app`);
    await tx.execute(sql`select set_config('app.tenant_id', ${ctx.tenantId}, true), set_config('app.user_id', ${ctx.userId ?? ""}, true)`);
    return fn(tx as Tx);
  });
}
export { schema };
