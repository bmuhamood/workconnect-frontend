import { sql } from "drizzle-orm";
import {
  pgTable, uuid, text, integer, boolean, timestamp, date, pgEnum, index, uniqueIndex,
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
  "invoices", "conversations", "messages", "reviews", "notifications", "email_outbox", "followups",
] as const;
