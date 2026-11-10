import { NextResponse } from "next/server";
import { clearLocalSession } from "@/lib/identity";
export async function POST() { await clearLocalSession(); return NextResponse.json({ ok: true }); }
