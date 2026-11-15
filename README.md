# WorkConnect

HR consultancy platform: **WorkConnect provides HR services to many client organisations, and each client's data is kept completely separate.** Next.js 16 · Neon Postgres · Neon Auth · Drizzle · Resend · Cloudinary. See `SYSTEM_DESIGN.md`.

## Roles
Super Admin and consultants (WorkConnect staff) · Client administrator · Manager · Employee. There is no self-registration: WorkConnect adds a client, and invitations bring people in.

## Setup
```bash
npm install
neon login && neon link --project-id <id> --branch production && neon deploy   # Postgres + Neon Auth; writes .env.local
echo "NEON_AUTH_COOKIE_SECRET=$(openssl rand -base64 32)" >> .env.local
echo "PLATFORM_SETUP_TOKEN=$(openssl rand -hex 24)" >> .env.local
npm run db:migrate            # tables, row-level security, restricted role
npm run test:isolation        # must end "All isolation checks passed"
npm run build && npm start
```
Then open **`/setup`**, enter the setup token, and create the Super Admin. After that, sign in and use **Platform console → Add a client**.

## Environment variables (Vercel)
`DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `PLATFORM_SETUP_TOKEN` (remove it after first use if you like), `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM` (an address on your Resend-verified domain), `CLOUDINARY_*`, and optionally `CONTACT_EMAIL`, `CONTACT_PHONE`, `CONTACT_ADDRESS` for the public Contact page. Add your site URL to Neon Auth's trusted origins. `/api/health` tells you what is missing, and whether your browser's session is recognised.

## Local demo
`npm run db:seed:reset` loads five client organisations plus WorkConnect staff (password `Password123!`, see `lib/demo-accounts.ts`). Local development uses a built-in login; production uses Neon Auth.

## Tests
- `npm run test:hr`: payroll maths against a published worked example
- `npm run test:isolation`: database-level proof that clients can't see each other
- `node scripts/e2e.mjs`: full workflow over HTTP (seed first; start the server with `PLATFORM_SETUP_TOKEN` and `ALLOW_LOCAL_AUTH=1`)
