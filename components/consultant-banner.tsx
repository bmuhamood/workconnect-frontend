"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { call, toast } from "@/lib/client";

/** Shown to WorkConnect staff while they are inside a client workspace. */
export function ConsultantBanner({ client }: { client: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <div role="status" className="border-b border-amber-600/40 bg-amber-50 print:hidden">
      <div className="container-x flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
        <span className="flex items-center gap-2 font-medium text-amber-700"><ShieldCheck className="size-4" aria-hidden="true" />WorkConnect consultant access · {client}. Your activity here is recorded.</span>
        <button disabled={busy} onClick={async () => { setBusy(true); try { await call("/api/platform/exit", "POST"); router.push("/platform"); router.refresh(); } catch (e) { toast((e as Error).message, "error"); setBusy(false); } }} className="rounded-lg border border-amber-600/50 px-3 py-1 font-semibold text-amber-700 hover:bg-amber-100">Exit workspace</button>
      </div>
    </div>
  );
}
