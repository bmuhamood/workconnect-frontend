"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function PayInvoice({ id }: { id: string }) {
  const router = useRouter();
  const [method, setMethod] = useState("mtn_momo");
  const [busy, setBusy] = useState(false);
  return (
    <div className="inline-flex items-center gap-2">
      <select value={method} onChange={(e) => setMethod(e.target.value)} className="input !w-auto !py-1.5"><option value="mtn_momo">MTN MoMo</option><option value="airtel_money">Airtel Money</option><option value="card">Card</option><option value="bank">Bank</option></select>
      <button disabled={busy} className={btn("primary", "sm")} onClick={async () => { setBusy(true); try { await call(`/api/invoices/${id}/pay`, "POST", { method }); toast("Payment recorded"); router.refresh(); } catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); } }}>{busy ? "Paying…" : "Pay"}</button>
    </div>
  );
}
