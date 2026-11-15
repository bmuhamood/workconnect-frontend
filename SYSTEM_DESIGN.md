# WorkConnect: System Design

WorkConnect is **one company that provides HR consultancy services to many client organisations** (companies, NGOs, schools, households). Each client's data is kept completely separate from every other client's.

## 1. Who is who

| Level | Who | What they can do |
|---|---|---|
| Platform | **Super WorkConnect Admin** | Adds clients, invites consultants, edits WorkConnect's packages, reads enquiries, sees the audit log. Not tied to any client. |
| Platform | **WorkConnect consultant** | WorkConnect staff who deliver the service. Can open any active client's workspace (recorded). Reads enquiries. Cannot add clients or edit packages. |
| Client | **Client administrator** | Runs their own organisation's workspace: invites managers and employees, HR settings, payroll, contracts, invoices. |
| Client | **Manager** | Monitors and approves for their own employees only. |
| Client | **Employee** | Clocks in, requests leave, reads payslips, raises HR questions. |

A **tenant is a client organisation**. The public website, packages and enquiry inbox belong to WorkConnect, not to any tenant.

## 2. Onboarding (there is no self-registration)

1. **First run:** open `/setup`, enter `PLATFORM_SETUP_TOKEN`, create the Super Admin. The page closes as soon as one exists.
2. The Super Admin adds a client (`/platform/new`): name, industry, administrator's email. This creates the client's private workspace and sends the administrator an **invitation**.
3. The client administrator accepts the invitation, then invites their managers and employees (bulk, one per line).
4. WorkConnect consultants are invited by the Super Admin the same way.

Invitations are personal and single-use. The link carries a random token (only its SHA-256 hash is stored), expires in 7 days, can be revoked or re-sent (a new link replaces the old one), and can only be accepted by the email address it was sent to. A newer invitation to the same email supersedes an older pending one.

## 3. Data separation (the core guarantee)

- Every business table has a `tenant_id`, filled in automatically from the request context.
- **Postgres Row-Level Security** is enabled and *forced* on every such table. Each request runs in a transaction that switches to a restricted role (`wc_app`, no `BYPASSRLS`) and sets `app.tenant_id`. With no tenant set, queries return zero rows.
- The `users` table is limited to people who are members of the current client, and password hashes and platform flags are not readable by the restricted role.
- WorkConnect's own tables (`platform_packages`, `platform_leads`, `audit_log`) have **no privileges** for the restricted role, so a client workspace cannot read them even by mistake.
- Platform emails (enquiries, staff invitations) have no tenant; client emails carry their tenant. A client never sees the other kind.
- `npm run test:isolation` proves all of this against real data (36 checks).

## 4. How WorkConnect staff work inside a client (transparency)

- A consultant opens a client from the platform console. This (a) creates a **consultant membership** in that client's workspace, (b) writes an **audit log** entry, and (c) shows an amber **banner** on every page while they are inside.
- The client's *Team* page lists the consultants who have access. Only WorkConnect can remove that access.
- Consultants **cannot** sign or end contracts, or pay invoices, in the client's name.
- Staff default to the platform console on sign-in; they never land in a client workspace by accident.
- Suspending a client blocks everyone in it (including consultants) from entering; its data is kept.

## 5. Authentication and sessions

- **Production:** Neon Auth (managed Better Auth). `proxy.ts` runs Neon's middleware, which renews the short-lived cached session cookie. (Without it, Server Components cannot write cookies and users are signed out every few minutes.) Each route and page still checks the session itself.
- **Local development:** a built-in email/password mode, refused in production unless `ALLOW_LOCAL_AUTH=1`.
- Identity (who you are) is separate from membership (which client you are in). A person can belong to more than one client.

## 6. Public site

Home, Services, Packages, About, Contact, Help, Terms, Privacy. Contact enquiries go to WorkConnect (`platform_leads`), are emailed to staff with Reply-To set to the sender, are rate-limited, and have a honeypot. Packages are WorkConnect's own, edited at `/platform/packages`. No client name or data ever appears on the public site; only aggregate counts.

## 7. Inside a client workspace

Vacancies and candidates, applications, contracts (with schedules and overtime), invoices and payment, messaging, reviews, and **HR Operations**: leave, attendance (with overtime approval), payroll (PAYE, NSSF, unpaid leave, overtime), payslips, CSV export, and an HR helpdesk. Statutory rates are set per client and **must be confirmed by an administrator before payroll can be approved**; changing a rate removes the confirmation.

## 8. Email

All email is sent by WorkConnect (from `EMAIL_FROM` on a Resend-verified domain). Messages sent for a client say "on behalf of {client}". Emails queue in an outbox, retry up to 5 times, and failed ones can be retried from the admin screen.

## 9. Not built yet / decisions for the owner

- Referral partners (for example GLOBIS) are not a platform concept. Clients they introduce are ordinary clients.
- A client's data is currently kept in one shared database with row-level security. Clients that require a dedicated database would need a separate deployment.
- Real mobile-money / card payment is not connected; payments are recorded.
- Leave policy and PAYE/NSSF defaults are starting points to be confirmed by each client.
