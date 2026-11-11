"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, toast } from "@/lib/client";

export function LineEditor({ id, allowances, otherDeductions, editable }: { id: string; allowances: number; otherDeductions: number; editable: boolean }) {
  const router = useRouter();
  const [a, setA] = useState(String(allowances));
  const [o, setO] = useState(String(otherDeductions));
  const [busy, setBusy] = useState(false);
  const dirty = Number(a) !== allowances || Number(o) !== otherDeductions;
  if (!editable) return <><td className="text-right">{allowances.toLocaleString()}</td><td className="text-right">{otherDeductions.toLocaleString()}</td></>;
  const inp = "input !w-28 !py-1.5 text-right";
  return (
    <>
      <td className="text-right"><input aria-label="Allowances" inputMode="numeric" value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ""))} className={inp} /></td>
      <td className="text-right"><input aria-label="Other deductions" inputMode="numeric" value={o} onChange={(e) => setO(e.target.value.replace(/\D/g, ""))} className={inp} />
        {dirty && <button disabled={busy} className="ml-2 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-onbrand" onClick={async () => {
          setBusy(true);
          try { await call(`/api/hr/payroll/lines/${id}`, "PATCH", { allowances: a || "0", otherDeductions: o || "0" }); toast("Line updated"); router.refresh(); } catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
        }}>Save</button>}</td>
    </>
  );
}
