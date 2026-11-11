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

export function LoginForm({ mode, demo = false, showDemo = false }: { mode: Mode; demo?: boolean; showDemo?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try { await signIn(mode, String(f.get("email")).trim().toLowerCase(), String(f.get("password")), demo); router.push("/dashboard"); router.refresh(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><input id="login-email" name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" /></Field>
      <Field label="Password"><input id="login-password" name="password" type="password" required autoComplete="current-password" className="input" /></Field>
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}Sign in</button>
      <p className="text-center text-sm text-slate-600">New here? <Link href="/register" className="font-medium text-accent underline">Create an account</Link> · Run an HR firm? <Link href="/register?as=organisation" className="font-medium text-accent underline">Register it</Link></p>
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

type Role = "worker" | "employer" | "agency";
const ROLES: { id: Role; title: string; hint: string }[] = [
  { id: "worker", title: "I'm looking for work", hint: "Create a profile and apply to jobs" },
  { id: "employer", title: "I want to hire", hint: "Post jobs and hire verified workers" },
  { id: "agency", title: "I run an HR firm", hint: "Create your organisation as its owner" },
];

export function RegisterForm({ mode, tenantName, finish, identityEmail, preselect }: { mode: Mode; tenantName: string | null; finish: boolean; identityEmail?: string; preselect?: "agency" }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(preselect === "agency" || !tenantName ? "agency" : "worker");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try {
      if (!finish) await signUp(mode, { email: f.email.trim().toLowerCase(), password: f.password, firstName: f.firstName, lastName: f.lastName, phone: f.phone });
      await call("/api/onboarding", "POST", { role, firstName: f.firstName, lastName: f.lastName, phone: f.phone, city: f.city || "Kampala", profession: f.profession, companyName: f.companyName, agencyName: f.agencyName });
      router.push("/dashboard"); router.refresh();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  const roles = ROLES;
  return (
    <form onSubmit={submit} className="space-y-5">
      {tenantName && role !== "agency" && <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-accent">Joining <b>{tenantName}</b></p>}
      {role === "agency" && <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-accent">You will become the <b>owner</b> of a new, private HR organisation. You can then onboard client companies and their employees.</p>}
      <div className="grid gap-2 sm:grid-cols-3">
        {roles.map((r) => (
          <button type="button" key={r.id} aria-pressed={role === r.id} disabled={!tenantName && r.id !== "agency"} onClick={() => setRole(r.id)} className={`rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${role === r.id ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-white hover:border-brand-400"}`}>
            <div className="text-sm font-semibold">{r.title}</div><div className="mt-0.5 text-xs text-slate-600">{r.hint}</div>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name"><input name="firstName" required className="input" autoComplete="given-name" /></Field>
        <Field label="Last name"><input name="lastName" required className="input" autoComplete="family-name" /></Field>
      </div>
      {!finish && <Field label="Email"><input name="email" type="email" required className="input" autoComplete="email" /></Field>}
      {finish && <p className="text-sm text-slate-500">Signed in as <b>{identityEmail}</b>. Finish setting up your account.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" hint="e.g. +256700123456"><input name="phone" type="tel" required className="input" autoComplete="tel" /></Field>
        <Field label="City"><input name="city" defaultValue="Kampala" required className="input" /></Field>
      </div>
      {role === "worker" && <Field label="Your profession"><input name="profession" required className="input" placeholder="e.g. Nanny, Driver, Cook" /></Field>}
      {role === "employer" && <Field label="Company or household name (optional)"><input name="companyName" className="input" /></Field>}
      {role === "agency" && <Field label="Organisation name"><input name="agencyName" required className="input" placeholder="e.g. Kampala Homes" /></Field>}
      {!finish && <Field label="Password" hint="At least 8 characters"><input name="password" type="password" minLength={8} required className="input" autoComplete="new-password" /></Field>}
      {error && <p role="alert" className="rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}{finish ? "Finish setup" : "Create account"}</button>
      {!finish && <p className="text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link></p>}
    </form>
  );
}
