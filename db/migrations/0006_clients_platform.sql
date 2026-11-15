CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_name" text NOT NULL,
	"tenant_id" uuid,
	"tenant_name" text,
	"action" text NOT NULL,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid,
	"kind" text DEFAULT 'member' NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"role" text,
	"token_hash" text NOT NULL,
	"invited_by" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" text,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"price_text" text DEFAULT 'Custom quote' NOT NULL,
	"billing_note" text DEFAULT '' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ALTER COLUMN "late_minutes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "attendance_records" ALTER COLUMN "overtime_minutes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "break_minutes" SET DEFAULT 60;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "late_grace_minutes" SET DEFAULT 15;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "overtime_rate_bps" SET DEFAULT 15000;--> statement-breakpoint
ALTER TABLE "email_outbox" ALTER COLUMN "tenant_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payroll_lines" ALTER COLUMN "overtime_minutes" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "payroll_lines" ALTER COLUMN "overtime_pay" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_super_admin" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "is_consultant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "industry" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_consultant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_tenant_idx" ON "audit_log" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "inv_token_uq" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "inv_tenant_idx" ON "invitations" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "inv_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "lead_email_idx" ON "platform_leads" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "lead_status_idx" ON "platform_leads" USING btree ("status","created_at");
--> statement-breakpoint
ALTER TABLE email_outbox ALTER COLUMN tenant_id DROP NOT NULL;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON invitations TO wc_app;
--> statement-breakpoint
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON invitations USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
REVOKE ALL ON platform_packages, platform_leads, audit_log FROM wc_app;
--> statement-breakpoint
ALTER TABLE platform_packages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE platform_leads ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
