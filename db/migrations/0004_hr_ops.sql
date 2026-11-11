CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"clock_in" timestamp with time zone,
	"clock_out" timestamp with time zone,
	"status" text DEFAULT 'present' NOT NULL,
	"source" text DEFAULT 'self' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"type" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"decision_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"basic" integer NOT NULL,
	"allowances" integer DEFAULT 0 NOT NULL,
	"unpaid_days" integer DEFAULT 0 NOT NULL,
	"unpaid_deduction" integer DEFAULT 0 NOT NULL,
	"other_deductions" integer DEFAULT 0 NOT NULL,
	"gross" integer NOT NULL,
	"nssf_employee" integer NOT NULL,
	"paye" integer NOT NULL,
	"net_pay" integer NOT NULL,
	"nssf_employer" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"period" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
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
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"requester_id" uuid NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT nullif(current_setting('app.tenant_id', true), '')::uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "timezone" text DEFAULT 'Africa/Kampala' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "work_start" text DEFAULT '08:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "late_grace_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "leave_policy" jsonb DEFAULT '{"annual":21,"sick":14,"maternity":60,"paternity":4,"compassionate":5}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "paye_bands" text DEFAULT '0,0
335000,10
410000,20
10000000,40' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "nssf_employee_bps" integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "nssf_employer_bps" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "nssf_cap" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "payroll_rates_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_run_id_payroll_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."payroll_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_worker_id_users_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "att_contract_day_uq" ON "attendance_records" USING btree ("contract_id","work_date");--> statement-breakpoint
CREATE INDEX "att_day_idx" ON "attendance_records" USING btree ("tenant_id","work_date");--> statement-breakpoint
CREATE INDEX "leave_worker_idx" ON "leave_requests" USING btree ("tenant_id","worker_id","start_date");--> statement-breakpoint
CREATE INDEX "leave_status_idx" ON "leave_requests" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "line_run_contract_uq" ON "payroll_lines" USING btree ("run_id","contract_id");--> statement-breakpoint
CREATE INDEX "line_worker_idx" ON "payroll_lines" USING btree ("tenant_id","worker_id");--> statement-breakpoint
CREATE UNIQUE INDEX "run_period_uq" ON "payroll_runs" USING btree ("tenant_id","period");--> statement-breakpoint
CREATE INDEX "ticket_req_idx" ON "support_tickets" USING btree ("tenant_id","requester_id");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "support_tickets" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tmsg_ticket_idx" ON "ticket_messages" USING btree ("ticket_id","created_at");
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON service_packages TO wc_app;
--> statement-breakpoint
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE service_packages FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON service_packages USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON leave_requests TO wc_app;
--> statement-breakpoint
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE leave_requests FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON leave_requests USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON attendance_records TO wc_app;
--> statement-breakpoint
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE attendance_records FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON attendance_records USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON payroll_runs TO wc_app;
--> statement-breakpoint
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payroll_runs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON payroll_runs USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON payroll_lines TO wc_app;
--> statement-breakpoint
ALTER TABLE payroll_lines ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE payroll_lines FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON payroll_lines USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON support_tickets TO wc_app;
--> statement-breakpoint
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE support_tickets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON support_tickets USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_messages TO wc_app;
--> statement-breakpoint
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE ticket_messages FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tenant_isolation ON ticket_messages USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);
