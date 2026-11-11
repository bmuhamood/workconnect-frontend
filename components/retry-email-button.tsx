"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCw } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

/** Retries one email (id) or all failed emails (no id), then refreshes so the new status is visible. */
export function RetryEmailButton({ id, label = "Retry", variant = "secondary" }: { id?: string; label?: string; variant?: Parameters<typeof btn>[0] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} className={btn(variant, "sm")} onClick={async () => {
      setBusy(true);
      try {
        const r = await call<{ retried: number }>("/api/admin/emails/retry", "POST", id ? { id } : {});
        toast(r.retried ? `Retrying ${r.retried} email${r.retried === 1 ? "" : "s"}…` : "No failed emails to retry");
        setTimeout(() => { router.refresh(); setBusy(false); }, 3500); // give the send a moment, then show the result
      } catch (e) { toast((e as Error).message, "error"); setBusy(false); }
    }}>{busy ? <Loader2 className="size-4 animate-spin" /> : <RotateCw className="size-4" />}{label}</button>
  );
}
