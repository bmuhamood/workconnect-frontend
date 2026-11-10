# WorkConnect

Multi-tenant hiring marketplace (Next.js 16 · Neon Postgres · Neon Auth · Drizzle · Resend). Deploys to Vercel.

## Architecture
- **Tenants**: every organisation (agency) is a `tenant`. Every business table has a `tenant_id` filled automatically from the request context.
- **Isolation**: Postgres Row-Level Security (`FORCE`d) on all tenant tables. Each request runs in a transaction that does `SET LOCAL ROLE wc_app` (a role without BYPASSRLS) and sets `app.tenant_id`. Without a tenant context, queries return zero rows. `npm run test:isolation` proves it.
- **Auth**: Neon Auth (Managed Better Auth). Without `NEON_AUTH_BASE_URL`, a local email/password fallback is used for development and is refused in production.
- **Email**: transactional + marketing + follow-ups are queued in `email_outbox`, sent via Resend (retries up to 5×), with a daily Vercel Cron (`/api/cron/emails`) for reminders. Auth emails (verification/reset) are sent by Neon Auth.

## Setup
```bash
npm install
neon login
neon link --project-id <your-project-id> --branch production   # or neon init
neon deploy                      # enables Postgres + Auth, writes .env.local
echo "NEON_AUTH_COOKIE_SECRET=$(openssl rand -base64 32)" >> .env.local
npm run db:migrate               # creates tables, RLS policies and the wc_app role
npm run test:isolation           # must print "All isolation checks passed"
npm run build && npm start
```
`npm run db:seed` loads two demo tenants (local logins only; demo users have no Neon Auth identity).

## Vercel
1. Import the GitHub repo in Vercel (framework: Next.js).
2. Set env vars from `.env.example` (DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL, CRON_SECRET).
3. Run `npm run db:migrate` once against the production database.
4. Add your Vercel URL to Neon Auth's trusted origins. Set `EMAIL_FROM` to an address on your Resend-verified domain (e.g. `notifications@listoq.com`), then sign in as an admin and use **Admin → Send a test email to me**.

## Tests
`scripts/test-isolation.mts` (DB-level) and `scripts/e2e.mjs` (HTTP workflow + cross-tenant attacks; needs a running server with local auth).
