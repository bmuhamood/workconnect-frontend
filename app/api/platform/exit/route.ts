import { NextResponse } from "next/server";
import { staffRoute } from "@/lib/http";
import { TENANT_COOKIE } from "@/lib/session";

export const POST = staffRoute(async () => { const res = NextResponse.json({ ok: true }); res.cookies.delete(TENANT_COOKIE); return res; });
