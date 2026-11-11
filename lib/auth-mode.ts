/** "neon" = Neon Auth (Managed Better Auth). "local" = email/password fallback for local development only. */
export const AUTH_MODE: "neon" | "local" = process.env.NEON_AUTH_BASE_URL ? "neon" : "local";
export const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
/**
 * TEST SWITCH. With ENABLE_DEMO_LOGIN=1 the seeded demo accounts (which have passwords but no Neon Auth identity)
 * can sign in even while Neon Auth is configured, and the login page lists them. Turn it OFF before real customers use the site.
 */
export const DEMO_LOGIN = process.env.ENABLE_DEMO_LOGIN === "1";
/** Password sign-in handled by this app itself (dev mode, or demo accounts). */
export const LOCAL_PASSWORDS = AUTH_MODE === "local" || DEMO_LOGIN;
/** Show the "demo accounts" helper on the login page. */
export const SHOW_DEMO_ACCOUNTS = DEMO_LOGIN || (AUTH_MODE === "local" && !isProd);
export function assertAuthConfigured() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (AUTH_MODE === "local" && isProd && process.env.ALLOW_LOCAL_AUTH !== "1" && !DEMO_LOGIN)
    throw new Error("Neon Auth is not configured: set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (run `neon deploy`).");
}
