// Generates the row-level-security SQL appended to the first migration.
import { TENANT_TABLES } from "./schema";
const T = "nullif(current_setting('app.tenant_id', true), '')::uuid";
const lines = [
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wc_app') THEN CREATE ROLE wc_app NOLOGIN NOBYPASSRLS; END IF; END $$;`,
  `DO $$ BEGIN EXECUTE format('GRANT wc_app TO %I', current_user); END $$;`,
  `GRANT USAGE ON SCHEMA public TO wc_app;`,
  `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wc_app;`,
  `REVOKE INSERT, UPDATE, DELETE ON tenants FROM wc_app;`,
  `REVOKE ALL ON users FROM wc_app;`,
  `GRANT SELECT (id, email, phone, first_name, last_name, is_active, created_at) ON users TO wc_app;`,
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wc_app;`,
];
for (const t of TENANT_TABLES) {
  lines.push(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`, `ALTER TABLE ${t} FORCE ROW LEVEL SECURITY;`);
  const using = t === "memberships" ? `tenant_id = ${T}` : `tenant_id = ${T}`;
  lines.push(`CREATE POLICY tenant_isolation ON ${t} USING (${using}) WITH CHECK (tenant_id = ${T});`);
}
lines.push(
  `ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;`, `ALTER TABLE tenants FORCE ROW LEVEL SECURITY;`,
  `CREATE POLICY tenant_self ON tenants FOR SELECT USING (id = ${T});`,
  `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`, `ALTER TABLE users FORCE ROW LEVEL SECURITY;`,
  `CREATE POLICY tenant_members_only ON users FOR SELECT USING (EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = users.id AND m.tenant_id = ${T}));`,
);
console.log(lines.join("\n--> statement-breakpoint\n"));
