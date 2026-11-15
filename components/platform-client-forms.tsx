"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

const copy = (url: string) => { navigator.clipboard?.writeText(url); toast("Link copied"); };
function LinkBox({ url, label }: { url: string; label: string }) {
  return (
    <div className="mt-4 rounded-xl border border-emerald-600/40 bg-emerald-50 p-4 text-sm" role="status">
      <div className="font-semibold text-emerald-700">{label}</div>
      <p className="mt-1 text-slate-600">An email has been queued. You can also share this personal link directly. It works once and expires in 7 days.</p>
      <div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate rounded bg-white/60 px-2 py-1 text-xs">{url}</code><button type="button" onClick={() => copy(url)} className="inline-flex shrink-0 items-center gap-1 font-medium text-accent hover:text-accent-strong"><Copy className="size-4" />Copy</button></div>
    </div>
  );
}

/** Add a client organisation and invite its administrator. */
export function NewClientForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ id: string; url: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try { const r = await call<{ id: string; inviteUrl: string }>("/api/platform/tenants", "POST", f); setDone({ id: r.id, url: r.inviteUrl }); toast("Client created"); router.refresh(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  if (done) return (
    <div><h2 className="text-lg font-bold">Client created</h2><LinkBox url={done.url} label="Invitation for the client administrator" />
      <div className="mt-6 flex gap-3"><button onClick={() => router.push(`/platform/clients/${done.id}`)} className={btn("primary", "md")}>Open the client</button><button onClick={() => { setDone(null); }} className={btn("secondary", "md")}>Add another client</button></div></div>);
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Client organisation name"><input name="orgName" required className="input" placeholder="e.g. Kiggundu Logistics Ltd" /></Field>
      <Field label="Industry (optional)"><input name="industry" className="input" placeholder="e.g. Logistics, Hospitality, Education" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Administrator's first name"><input name="adminFirstName" className="input" /></Field><Field label="Administrator's email" hint="They receive the invitation"><input name="adminEmail" type="email" required className="input" /></Field></div>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}Create client and send invitation</button>
    </form>
  );
}

/** Small invite form used on the client detail page (another administrator) and the Team page (consultant). */
export function InviteOneForm({ url, label, withFirstName = true, cta }: { url: string; label: string; withFirstName?: boolean; cta: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState<string | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true); setError(""); setLink(null);
    try { const r = await call<{ inviteUrl: string }>(url, "POST", f); setLink(r.inviteUrl); form.reset(); router.refresh(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Email"><input name="email" type="email" required className="input" /></Field>
        {withFirstName ? <Field label="First name (optional)"><input name="firstName" className="input" /></Field> : <span />}
        <button disabled={busy} className={btn("primary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}{cta}</button>
      </div>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      {link && <LinkBox url={link} label={label} />}
    </form>
  );
}

export function EnterWorkspaceButton({ id, label = "Open workspace" }: { id: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button disabled={busy} className={btn("primary", "sm")} onClick={async () => { setBusy(true); try { await call(`/api/platform/tenants/${id}/enter`, "POST"); router.push("/dashboard"); router.refresh(); } catch (e) { toast((e as Error).message, "error"); setBusy(false); } }}>{busy && <Loader2 className="size-4 animate-spin" />}{label}</button>;
}

export function ClientSettingsForm({ id, name, industry, feePercent }: { id: string; name: string; industry: string; feePercent: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try { await call(`/api/platform/tenants/${id}`, "PATCH", { action: "update", ...f }); toast("Client updated"); router.refresh(); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3"><Field label="Name"><input name="name" required defaultValue={name} className="input" /></Field><Field label="Industry"><input name="industry" defaultValue={industry} className="input" /></Field><Field label="Service fee (%)" hint="Charged on each monthly invoice"><input name="serviceFeePercent" type="number" step="0.5" min={0} max={50} defaultValue={feePercent} className="input" /></Field></div>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("secondary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}Save</button>
    </form>
  );
}
