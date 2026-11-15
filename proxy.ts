import { NextResponse, type NextRequest } from "next/server";

/**
 * Neon Auth keeps a short-lived cached copy of the session in a cookie. Only middleware (not Server Components) can write cookies,
 * so this is what renews that cookie when it expires. Without it users are signed out every few minutes.
 * Each route handler and page still checks the session itself; this layer only refreshes it and redirects signed-out visitors.
 */
const PUBLIC = ["/", "/login", "/register", "/invite", "/setup", "/services", "/packages", "/contact", "/about", "/help", "/terms", "/privacy", "/unsubscribe", "/api"];

export default async function proxy(req: NextRequest) {
  if (!process.env.NEON_AUTH_BASE_URL) return NextResponse.next(); // local development auth: nothing to refresh
  const { neonAuth } = await import("@/lib/neon-auth");
  return neonAuth.middleware({ loginUrl: "/login", publicRoutes: PUBLIC })(req) as Promise<NextResponse>;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"] };
