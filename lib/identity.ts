import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { AUTH_MODE, LOCAL_PASSWORDS, assertAuthConfigured } from "@/lib/auth-mode";

export type Identity = { authId: string; email: string; name: string };
const COOKIE = "wc_local_session";
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ chars) for local auth");
  return new TextEncoder().encode(s);
};

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);

/** Who is signed in (identity only; tenant/role come from lib/session). */
export async function getIdentity(): Promise<Identity | null> {
  try { assertAuthConfigured(); } catch (e) {
    // Misconfigured deployment: keep public pages working (signed-out) and point at /api/health.
    console.error("[auth]", (e as Error).message);
    return null;
  }
  // 1) App-managed password session (local dev, or seeded demo accounts when ENABLE_DEMO_LOGIN=1).
  if (LOCAL_PASSWORDS) {
    const token = (await cookies()).get(COOKIE)?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secret());
        if (payload.sub) return { authId: payload.sub, email: String(payload.email), name: String(payload.name ?? "") };
      } catch { /* expired or invalid: fall through */ }
    }
  }
  // 2) Neon Auth session.
  if (AUTH_MODE === "neon") {
    try {
      const { neonAuth } = await import("@/lib/neon-auth");
      const { data } = await neonAuth.getSession();
      const u = data?.user;
      return u ? { authId: u.id, email: u.email.toLowerCase(), name: u.name ?? "" } : null;
    } catch (e) {
      console.error("[auth] Neon Auth session lookup failed (check NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET):", (e as Error).message);
      return null;
    }
  }
  return null;
}

// ---- local development auth (never used when Neon Auth is configured) ----
export async function setLocalSession(i: Identity) {
  const token = await new SignJWT({ email: i.email, name: i.name }).setProtectedHeader({ alg: "HS256" })
    .setSubject(i.authId).setIssuedAt().setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function clearLocalSession() { (await cookies()).delete(COOKIE); }
