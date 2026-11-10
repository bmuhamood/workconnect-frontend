import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (/neon\.tech|neon\.build/.test(url)) {
    await migrateNeon(drizzleNeon(neon(url)), { migrationsFolder: "db/migrations" });
  } else {
    const pool = new Pool({ connectionString: url });
    await migratePg(drizzlePg(pool), { migrationsFolder: "db/migrations" });
    await pool.end();
  }
  console.log("Migrations applied");
}
main().catch((e) => { console.error(e); process.exit(1); });
