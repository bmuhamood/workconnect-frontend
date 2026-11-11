"use client";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { call } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

export function ContactForm({ topics, defaults }: { topics: readonly string[]; defaults?: { name?: string; email?: string; topic?: string; message?: string } }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try { await call("/api/contact", "POST", f); setSent(f.email); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  if (sent) return (
    <div className="card p-8 text-center" role="status">
      <CheckCircle2 className="mx-auto size-10 text-signal" />
      <h2 className="mt-4 text-xl font-bold">Message sent</h2>
      <p className="mt-2 text-sm text-slate-500">We've emailed a confirmation to <b className="text-slate-700">{sent}</b> and will reply there.</p>
      <button onClick={() => setSent(null)} className={btn("secondary", "md") + " mt-6"}>Send another message</button>
    </div>
  );
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name"><input name="name" required defaultValue={defaults?.name} autoComplete="name" className="input" /></Field>
        <Field label="Email"><input name="email" type="email" required defaultValue={defaults?.email} autoComplete="email" className="input" /></Field>
      </div>
      <Field label="What's it about?"><select name="topic" required defaultValue={defaults?.topic ?? ""} className="input"><option value="" disabled>Choose a topic</option>{topics.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label="Message"><textarea name="message" required rows={6} maxLength={4000} defaultValue={defaults?.message} className="input" placeholder="Tell us what you need and we'll get back to you." /></Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full sm:w-auto"}>{busy && <Loader2 className="size-4 animate-spin" />}Send message</button>
    </form>
  );
}
