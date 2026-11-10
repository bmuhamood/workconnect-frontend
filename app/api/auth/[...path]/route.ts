import { AUTH_MODE } from "@/lib/auth-mode";

// Neon Auth (Managed Better Auth) proxy. Disabled when running with local development auth.
async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  if (AUTH_MODE !== "neon") return Response.json({ error: "Neon Auth is not configured" }, { status: 404 });
  const { neonAuth } = await import("@/lib/neon-auth");
  const h = neonAuth.handler();
  return (h[req.method as "GET"] as (r: Request, c: unknown) => Promise<Response>)(req, ctx);
}
export const GET = handle, POST = handle, PUT = handle, DELETE = handle, PATCH = handle;
