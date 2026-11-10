"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}</label>;
}

/** JSON form: collects named inputs, POSTs/PATCHes them, shows inline + toast errors, then redirects/refreshes. */
export function AjaxForm({ url, method = "POST", submit = "Save", success, redirect, extra, className, children, reset }: {
  url: string; method?: string; submit?: string; success?: string; redirect?: string; extra?: Record<string, unknown>;
  className?: string; children: React.ReactNode; reset?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, unknown> = {};
    new FormData(form).forEach((v, k) => { if (typeof v === "string" && v !== "") data[k] = v; });
    setBusy(true); setError("");
    try {
      const out = await call<{ id?: string }>(url, method, { ...data, ...extra });
      if (success) toast(success);
      if (reset) form.reset();
      if (redirect) router.push(redirect.replace(":id", out.id ?? ""));
      router.refresh();
    } catch (err) { setError((err as Error).message); toast((err as Error).message, "error"); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={onSubmit} className={className ?? "space-y-4"}>
      {children}
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "md") + " w-full sm:w-auto"}>{busy && <Loader2 className="size-4 animate-spin" />}{submit}</button>
    </form>
  );
}
