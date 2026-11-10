"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signUp, type Mode } from "@/lib/auth-client";
import { call } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

export function LoginForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try { await signIn(mode, String(f.get("email")).trim().toLowerCase(), String(f.get("password"))); router.push("/dashboard"); router.refresh(); }
    catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email"><input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" /></Field>
      <Field label="Password"><input name="password" type="password" required autoComplete="current-password" className="input" /></Field>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}Sign in</button>
      <p className="text-center text-sm text-slate-500">New here? <Link href="/register" className="font-medium text-accent hover:underline">Create an account</Link></p>
    </form>
  );
}

type Role = "worker" | "employer" | "agency";
const ROLES: { id: Role; title: string; hint: string }[] = [
  { id: "worker", title: "I'm looking for work", hint: "Create a profile and apply to jobs" },
  { id: "employer", title: "I want to hire", hint: "Post jobs and hire verified workers" },
  { id: "agency", title: "I run an agency", hint: "Create your own private workspace" },
];

export function RegisterForm({ mode, tenantName, finish, identityEmail }: { mode: Mode; tenantName: string | null; finish: boolean; identityEmail?: string }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(tenantName ? "worker" : "agency");
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
  const roles = tenantName ? ROLES : ROLES.filter((r) => r.id === "agency");
  return (
    <form onSubmit={submit} className="space-y-5">
      {tenantName && <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-accent">Joining <b>{tenantName}</b></p>}
      <div className="grid gap-2 sm:grid-cols-3">
        {roles.map((r) => (
          <button type="button" key={r.id} onClick={() => setRole(r.id)} className={`rounded-xl border p-3 text-left transition ${role === r.id ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <div className="text-sm font-semibold">{r.title}</div><div className="mt-0.5 text-xs text-slate-500">{r.hint}</div>
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
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "lg") + " w-full"}>{busy && <Loader2 className="size-4 animate-spin" />}{finish ? "Finish setup" : "Create account"}</button>
      {!finish && <p className="text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link></p>}
    </form>
  );
}
