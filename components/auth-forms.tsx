"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signUp, type Mode } from "@/lib/auth-client";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-accounts";
import { call } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

export function LoginForm({ mode, demo = false, showDemo = false, next }: { mode: Mode; demo?: boolean; showDemo?: boolean; next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try { await signIn(mode, String(f.get("email")).trim().toLowerCase(), String(f.get("password")), demo); router.push(next && /^\/invite\/[\w-]+$/.test(next) ? next : "/dashboard"); router.refresh(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><input id="login-email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" /></Field>
      <Field label="Password"><input id="login-password" name="password" type="password" required autoComplete="current-password" className="input" /></Field>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}Sign in</button>
      <p className="text-center text-sm text-slate-600">Accounts are created by invitation. Need access for your organisation? <Link href="/contact?topic=consultation" className="font-medium text-accent underline">Talk to WorkConnect</Link></p>
      {showDemo && <DemoAccounts />}
    </form>
  );
}

/** Test accounts (shown only when demo login is enabled). Clicking one fills the form. */
function DemoAccounts() {
  const fill = (email: string) => {
    const e = document.getElementById("login-email") as HTMLInputElement | null, p = document.getElementById("login-password") as HTMLInputElement | null;
    if (e) e.value = email; if (p) p.value = DEMO_PASSWORD;
    e?.focus();
  };
  const orgs = [...new Set(DEMO_ACCOUNTS.map((a) => a.org))];
  return (
    <details className="rounded-xl border border-slate-300 p-4 text-sm">
      <summary className="cursor-pointer font-semibold">Demo accounts for testing (password: <code>{DEMO_PASSWORD}</code>)</summary>
      <div className="mt-3 space-y-4">
        {orgs.map((o) => (
          <div key={o}><div className="mb-1 font-semibold text-slate-800">{o}</div>
            <ul className="space-y-1">{DEMO_ACCOUNTS.filter((a) => a.org === o).map((a) => (
              <li key={a.email}><button type="button" onClick={() => fill(a.email)} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-100"><span className="font-medium">{a.label}</span><span className="block text-xs text-slate-600">{a.email} · {a.note}</span></button></li>))}</ul></div>))}
      </div>
    </details>
  );
}

const field = (label: string, el: React.ReactNode) => <Field label={label}>{el}</Field>;
type InviteProps = { mode: Mode; token: string; email: string; firstName?: string; roleLabel: string; role: string; org?: string; staff: boolean; finish: boolean };

/** Completes an invitation. The email is fixed to the address the invitation was sent to. */
export function InviteForm({ mode, token, email, firstName, roleLabel, role, org, staff, finish }: InviteProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try {
      if (!finish) await signUp(mode, { email, password: f.password, firstName: f.firstName, lastName: f.lastName, phone: f.phone });
      await call("/api/onboarding", "POST", { token, firstName: f.firstName, lastName: f.lastName, phone: f.phone, city: f.city || undefined, profession: f.profession || undefined, companyName: f.companyName || undefined });
      router.push(staff ? "/platform" : "/dashboard"); router.refresh();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-accent">{staff ? <>You're joining the <b>WorkConnect</b> team as a consultant.</> : <>You're joining <b>{org}</b> as <b>{roleLabel.toLowerCase()}</b>.</>}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("First name", <input name="firstName" required defaultValue={firstName} autoComplete="given-name" className="input" />)}
        {field("Last name", <input name="lastName" required autoComplete="family-name" className="input" />)}
      </div>
      {field("Email", <input value={email} readOnly aria-readonly="true" className="input opacity-80" />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("Phone", <input name="phone" type="tel" required autoComplete="tel" className="input" placeholder="+256700123456" />)}
        {!staff && field("City", <input name="city" defaultValue="Kampala" className="input" />)}
      </div>
      {!staff && role === "worker" && field("Your job title", <input name="profession" required className="input" placeholder="e.g. Driver, Cook, Accountant" />)}
      {!finish && field("Choose a password", <input name="password" type="password" minLength={8} required autoComplete="new-password" className="input" />)}
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}{finish ? "Accept invitation" : "Create account and join"}</button>
      {!finish && <p className="text-center text-sm text-slate-600">Already have an account? <Link href={`/login?next=/invite/${token}`} className="font-medium text-accent underline">Sign in to accept</Link></p>}
    </form>
  );
}

/** One-time creation of the first Super WorkConnect Admin. */
export function SetupForm({ mode, finish, email }: { mode: Mode; finish: boolean; email?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try {
      if (!finish) await signUp(mode, { email: f.email.trim().toLowerCase(), password: f.password, firstName: f.firstName, lastName: f.lastName, phone: f.phone });
      await call("/api/setup", "POST", { token: f.token, firstName: f.firstName, lastName: f.lastName, phone: f.phone });
      router.push("/platform"); router.refresh();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      {field("Setup token", <input name="token" type="password" required autoComplete="off" className="input" />)}
      <div className="grid gap-4 sm:grid-cols-2">{field("First name", <input name="firstName" required className="input" />)}{field("Last name", <input name="lastName" required className="input" />)}</div>
      {finish ? <p className="text-sm text-slate-600">Signed in as <b>{email}</b>.</p> : field("Email", <input name="email" type="email" required className="input" />)}
      {field("Phone", <input name="phone" type="tel" required className="input" />)}
      {!finish && field("Password", <input name="password" type="password" minLength={8} required autoComplete="new-password" className="input" />)}
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}Create Super Admin</button>
    </form>
  );
}
