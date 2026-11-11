ALTER TABLE "users" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "work_start" text DEFAULT '08:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "work_end" text DEFAULT '17:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "work_days" text DEFAULT '1,2,3,4,5' NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "break_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "late_grace_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "overtime_rate_bps" integer DEFAULT 15000 NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "late_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "overtime_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "overtime_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "overtime_decided_by" uuid;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD COLUMN "overtime_decided_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD COLUMN "overtime_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payroll_lines" ADD COLUMN "overtime_pay" integer DEFAULT 0 NOT NULL;
