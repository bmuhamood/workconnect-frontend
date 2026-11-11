import { sql } from "drizzle-orm";
import {
  pgTable, uuid, text, integer, boolean, timestamp, date, pgEnum, index, uniqueIndex, jsonb,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["worker", "employer", "admin"]);
export const emailStatusEnum = pgEnum("email_status", ["queued", "sent", "failed", "skipped"]);
export const availabilityEnum = pgEnum("availability", ["available", "part_time", "busy", "unavailable"]);
export const jobStatusEnum = pgEnum("job_status", ["open", "filled", "closed"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "shortlisted", "accepted", "rejected", "withdrawn"]);
export const contractStatusEnum = pgEnum("contract_status", ["draft", "pending_signature", "active", "completed", "terminated"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "overdue"]);

/** Filled automatically from the request's tenant context; enforced by Postgres RLS. */
const tenantCol = () => uuid("tenant_id").notNull().default(sql`nullif(current_setting('app.tenant_id', true), '')::uuid`).references(() => tenants.id, { onDelete: "cascade" });
const ts = (name: string) => timestamp(name, { withTimezone: true }).defaultNow().notNull();

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  domain: text("domain"),
  brandColor: text("brand_color").notNull().default("#4f46e5"),
  serviceFeeBps: integer("service_fee_bps").notNull().default(1000),
  emailFromName: text("email_from_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  // HR Operations settings
  timezone: text("timezone").notNull().default("Africa/Kampala"),
  workStart: text("work_start").notNull().default("08:00"),
  lateGraceMinutes: integer("late_grace_minutes").notNull().default(15),
  leavePolicy: jsonb("leave_policy").$type<Record<string, number>>().notNull().default({ annual: 21, sick: 14, maternity: 60, paternity: 4, compassionate: 5 }),
  payeBands: text("paye_bands").notNull().default("0,0\n335000,10\n410000,20\n10000000,40"),
  nssfEmployeeBps: integer("nssf_employee_bps").notNull().default(500),
  nssfEmployerBps: integer("nssf_employer_bps").notNull().default(1000),
  nssfCap: integer("nssf_cap").notNull().default(0),
  payrollRatesConfirmedAt: timestamp("payroll_rates_confirmed_at", { withTimezone: true }),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("tenants_slug_uq").on(t.slug), uniqueIndex("tenants_domain_uq").on(t.domain)]);

/** Global identity record (one per person). Business data lives in tenant-scoped tables. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: text("auth_id").notNull(), // Neon Auth user id (or local dev id)
  email: text("email").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"), // local dev auth only; null with Neon Auth
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("users_email_uq").on(t.email), uniqueIndex("users_auth_uq").on(t.authId)]);

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(true),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("mem_tenant_user_uq").on(t.tenantId, t.userId), index("mem_user_idx").on(t.userId)]);

export const workerProfiles = pgTable("worker_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  profession: text("profession").notNull().default(""),
  categoryId: uuid("category_id"),
  bio: text("bio").notNull().default(""),
  city: text("city").notNull().default("Kampala"),
  district: text("district"),
  experienceYears: integer("experience_years").notNull().default(0),
  expectedSalary: integer("expected_salary").notNull().default(0),
  skills: text("skills").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  availability: availabilityEnum("availability").notNull().default("available"),
  verified: boolean("verified").notNull().default(false),
  nationalId: text("national_id"),
  ratingAvg: integer("rating_avg_x100").notNull().default(0), // rating * 100
  reviewsCount: integer("reviews_count").notNull().default(0),
  updatedAt: ts("updated_at"),
}, (t) => [uniqueIndex("wp_user_uq").on(t.tenantId, t.userId), index("wp_city_idx").on(t.city), index("wp_cat_idx").on(t.categoryId)]);

export const employerProfiles = pgTable("employer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  city: text("city").notNull().default("Kampala"),
  address: text("address"),
  updatedAt: ts("updated_at"),
}, (t) => [uniqueIndex("ep_user_uq").on(t.tenantId, t.userId)]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon").notNull().default("briefcase"),
}, (t) => [uniqueIndex("cat_slug_uq").on(t.tenantId, t.slug)]);

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  employerId: uuid("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  location: text("location").notNull(),
  schedule: text("schedule"),
  status: jobStatusEnum("status").notNull().default("open"),
  createdAt: ts("created_at"),
}, (t) => [index("jobs_status_idx").on(t.status, t.createdAt), index("jobs_employer_idx").on(t.employerId)]);

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coverLetter: text("cover_letter"),
  expectedSalary: integer("expected_salary"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("app_job_worker_uq").on(t.jobId, t.workerId), index("app_worker_idx").on(t.workerId)]);

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  employerId: uuid("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  salary: integer("salary").notNull(), // monthly UGX paid to worker
  serviceFee: integer("service_fee").notNull(), // platform fee
  startDate: date("start_date").notNull(),
  location: text("location"),
  hoursPerWeek: integer("hours_per_week").notNull().default(40),
  status: contractStatusEnum("status").notNull().default("pending_signature"),
  signedByEmployer: boolean("signed_by_employer").notNull().default(false),
  signedByWorker: boolean("signed_by_worker").notNull().default(false),
  terminationReason: text("termination_reason"),
  createdAt: ts("created_at"),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
}, (t) => [index("ct_emp_idx").on(t.employerId), index("ct_wrk_idx").on(t.workerId)]);

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  number: text("number").notNull(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // YYYY-MM
  salaryAmount: integer("salary_amount").notNull(),
  feeAmount: integer("fee_amount").notNull(),
  total: integer("total").notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  dueDate: date("due_date").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paymentMethod: text("payment_method"),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("inv_number_uq").on(t.tenantId, t.number), uniqueIndex("inv_contract_period_uq").on(t.contractId, t.period)]);

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  userA: uuid("user_a").notNull().references(() => users.id, { onDelete: "cascade" }),
  userB: uuid("user_b").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: ts("last_message_at"),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("conv_pair_uq").on(t.tenantId, t.userA, t.userB)]);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: ts("created_at"),
}, (t) => [index("msg_conv_idx").on(t.conversationId, t.createdAt)]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revieweeId: uuid("reviewee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("rev_contract_reviewer_uq").on(t.contractId, t.reviewerId), index("rev_reviewee_idx").on(t.revieweeId)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  link: text("link"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: ts("created_at"),
}, (t) => [index("notif_user_idx").on(t.userId, t.createdAt)]);

export const emailOutbox = pgTable("email_outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  toEmail: text("to_email").notNull(),
  toName: text("to_name"),
  replyTo: text("reply_to"),
  template: text("template").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  text: text("text").notNull(),
  status: emailStatusEnum("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  providerId: text("provider_id"),
  createdAt: ts("created_at"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
}, (t) => [index("outbox_status_idx").on(t.status, t.createdAt)]);

/** Messages sent through the public contact form (one inbox per tenant). */
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  createdAt: ts("created_at"),
}, (t) => [index("contact_tenant_idx").on(t.tenantId, t.createdAt), index("contact_email_idx").on(t.tenantId, t.email, t.createdAt)]);

export const servicePackages = pgTable("service_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  priceText: text("price_text").notNull().default("Custom quote"),
  billingNote: text("billing_note").notNull().default(""),
  features: text("features").array().notNull().default([]),
  highlighted: boolean("highlighted").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: ts("created_at"),
});

export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | cancelled
  decidedBy: uuid("decided_by"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  decisionNote: text("decision_note"),
  createdAt: ts("created_at"),
}, (t) => [index("leave_worker_idx").on(t.tenantId, t.workerId, t.startDate), index("leave_status_idx").on(t.tenantId, t.status)]);

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workDate: date("work_date").notNull(),
  clockIn: timestamp("clock_in", { withTimezone: true }),
  clockOut: timestamp("clock_out", { withTimezone: true }),
  status: text("status").notNull().default("present"), // present | late
  source: text("source").notNull().default("self"), // self | manual
  note: text("note"),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("att_contract_day_uq").on(t.contractId, t.workDate), index("att_day_idx").on(t.tenantId, t.workDate)]);

export const payrollRuns = pgTable("payroll_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  period: text("period").notNull(), // YYYY-MM
  status: text("status").notNull().default("draft"), // draft | approved | paid
  createdBy: uuid("created_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("run_period_uq").on(t.tenantId, t.period)]);

export const payrollLines = pgTable("payroll_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  runId: uuid("run_id").notNull().references(() => payrollRuns.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id").notNull().references(() => contracts.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  employerId: uuid("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  basic: integer("basic").notNull(),
  allowances: integer("allowances").notNull().default(0),
  unpaidDays: integer("unpaid_days").notNull().default(0),
  unpaidDeduction: integer("unpaid_deduction").notNull().default(0),
  otherDeductions: integer("other_deductions").notNull().default(0),
  gross: integer("gross").notNull(),
  nssfEmployee: integer("nssf_employee").notNull(),
  paye: integer("paye").notNull(),
  netPay: integer("net_pay").notNull(),
  nssfEmployer: integer("nssf_employer").notNull(),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("line_run_contract_uq").on(t.runId, t.contractId), index("line_worker_idx").on(t.tenantId, t.workerId)]);

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  requesterId: uuid("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"), // open | in_progress | resolved
  updatedAt: ts("updated_at"),
  createdAt: ts("created_at"),
}, (t) => [index("ticket_req_idx").on(t.tenantId, t.requesterId), index("ticket_status_idx").on(t.tenantId, t.status)]);

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: ts("created_at"),
}, (t) => [index("tmsg_ticket_idx").on(t.ticketId, t.createdAt)]);

/** Dedupes automated follow-ups so a reminder is only sent once per entity/kind. */
export const followups = pgTable("followups", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: tenantCol(),
  kind: text("kind").notNull(),
  entityId: uuid("entity_id").notNull(),
  createdAt: ts("created_at"),
}, (t) => [uniqueIndex("fu_uq").on(t.tenantId, t.kind, t.entityId)]);

export const TENANT_TABLES = [
  "memberships", "worker_profiles", "employer_profiles", "categories", "jobs", "applications", "contracts",
  "invoices", "conversations", "messages", "reviews", "notifications", "email_outbox", "followups", "contact_messages", "service_packages", "leave_requests", "attendance_records", "payroll_runs", "payroll_lines", "support_tickets", "ticket_messages",
] as const;
