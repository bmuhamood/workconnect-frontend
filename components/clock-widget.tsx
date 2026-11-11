"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function ClockWidget({ state, since }: { state: "out" | "in" | "done" | "leave"; since?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go(action: "in" | "out") {
    setBusy(true);
    try { const r = await call<{ status?: string }>("/api/hr/attendance/clock", "POST", { action }); toast(action === "in" ? (r.status === "late" ? "Clocked in (late)" : "Clocked in") : "Clocked out"); router.refresh(); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  }
  const icon = busy ? <Loader2 className="size-4 animate-spin" /> : null;
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
      <div>
        <div className="text-sm text-slate-500">Today</div>
        <div className="mt-1 font-display text-xl font-semibold">{state === "out" ? "You haven't clocked in" : state === "in" ? `Clocked in at ${since}` : state === "done" ? "Day complete" : "On approved leave"}</div>
      </div>
      {state === "out" && <button disabled={busy} onClick={() => go("in")} className={btn("primary", "lg")}>{icon ?? <LogIn className="size-4" />}Clock in</button>}
      {state === "in" && <button disabled={busy} onClick={() => go("out")} className={btn("secondary", "lg")}>{icon ?? <LogOut className="size-4" />}Clock out</button>}
    </div>
  );
}
