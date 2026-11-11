"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

/** Ends a contract after asking for a reason (kept on the contract and sent to the other party). */
export function TerminateButton({ contractId, label = "Terminate", pending = false, redirect }: { contractId: string; label?: string; pending?: boolean; redirect?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try { await call(`/api/contracts/${contractId}`, "PATCH", { action: "terminate", reason: reason.trim() || undefined }); toast("Contract ended"); setOpen(false); if (redirect) router.push(redirect); router.refresh(); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className={btn("danger", "md")}>{pending ? "Decline / cancel" : label}</button>;
  return (
    <div role="dialog" aria-label="End contract" className="card w-full max-w-md space-y-3 border-rose-600/50 p-4">
      <p className="text-sm font-semibold">End this contract?</p>
      <p className="text-sm text-slate-600">The employee stops being active, and the other party is notified with your reason.</p>
      <label className="block text-sm"><span className="mb-1 block font-medium">Reason (optional)</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={1000} className="input" /></label>
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={go} className={btn("danger", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}Yes, end contract</button>
        <button type="button" onClick={() => setOpen(false)} className={btn("secondary", "md")}>Keep it</button>
      </div>
    </div>
  );
}
