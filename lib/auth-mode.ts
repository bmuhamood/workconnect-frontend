/** "neon" = Neon Auth (Managed Better Auth). "local" = email/password fallback for local development only. */
export const AUTH_MODE: "neon" | "local" = process.env.NEON_AUTH_BASE_URL ? "neon" : "local";
export const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
export function assertAuthConfigured() {
  if (AUTH_MODE === "local" && isProd && process.env.ALLOW_LOCAL_AUTH !== "1")
    throw new Error("Neon Auth is not configured: set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET (run `neon deploy`).");
}
