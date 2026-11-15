"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

type Result = { created: { email: string; url: string }[]; skipped: { email: string; reason: string }[] };
export function InvitePeople() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true); setError(""); setRes(null);
    try { const r = await call<Result>("/api/admin/invitations", "POST", f); setRes(r); toast(`${r.created.length} invitation${r.created.length === 1 ? "" : "s"} sent`); if (r.created.length) form.reset(); router.refresh(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Invite as"><select name="role" defaultValue="worker" className="input"><option value="worker">Employee</option><option value="employer">Manager</option><option value="admin">Client administrator</option></select></Field>
      <Field label="Email addresses" hint='One per line. You can add a name: "Jane Doe <jane@company.com>"'><textarea name="lines" required rows={5} className="input" placeholder={"jane@company.com\nJohn Okello <john@company.com>"} /></Field>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}Send invitations</button>
      {res && (
        <div className="space-y-2 text-sm" aria-live="polite">
          {res.created.length > 0 && <div><div className="font-semibold text-emerald-700">Sent to {res.created.length}</div><p className="text-xs text-slate-500">Emails are on their way. You can also copy a link to share directly.</p><ul className="mt-1 space-y-1">{res.created.map((c) => <li key={c.email} className="flex items-center justify-between gap-2"><span className="truncate">{c.email}</span><button type="button" onClick={() => { navigator.clipboard?.writeText(c.url); toast("Link copied"); }} className="inline-flex items-center gap-1 text-accent hover:text-accent-strong"><Copy className="size-3.5" />Copy link</button></li>)}</ul></div>}
          {res.skipped.length > 0 && <div><div className="font-semibold text-amber-700">Skipped {res.skipped.length}</div><ul className="mt-1 space-y-0.5 text-slate-600">{res.skipped.map((s) => <li key={s.email}>{s.email}: {s.reason}</li>)}</ul></div>}
        </div>)}
    </form>
  );
}
