import type { Metadata } from "next";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/session";
import { LOCAL_PASSWORDS } from "@/lib/auth-mode";
import { AjaxForm, Field } from "@/components/ajax-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Add HR consultancy" };
export default async function NewOrganisation() {
  await requirePlatformAdmin();
  return (
    <div className="container-x max-w-2xl py-10">
      <Link href="/platform" className="text-sm text-slate-500 hover:text-slate-800">← Platform console</Link>
      <PageHeader title="Add an HR consultancy" subtitle="Creates the organisation, its default categories and packages, and the owner's login." />
      {!LOCAL_PASSWORDS ? (
        <div className="card p-6 text-sm leading-relaxed text-slate-600">This deployment uses Neon Auth for sign-in, which cannot be pre-provisioned from here. Ask the consultancy owner to click <b>Register your HR firm</b> on the public home page. They become the organisation's owner automatically, and it then appears in your console.</div>
      ) : (
        <div className="card p-6">
          <AjaxForm url="/api/platform/tenants" submit="Create organisation" success="Organisation created" redirect="/platform">
            <Field label="Organisation name"><input name="orgName" required className="input" placeholder="e.g. Jinja HR Partners" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Owner first name"><input name="firstName" required className="input" /></Field><Field label="Owner last name"><input name="lastName" required className="input" /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Owner email"><input name="email" type="email" required className="input" /></Field><Field label="Owner phone" hint="e.g. +256700123456"><input name="phone" type="tel" required className="input" /></Field></div>
            <Field label="Temporary password" hint="At least 8 characters. Ask the owner to change it after first sign-in."><input name="password" type="text" minLength={8} required className="input" autoComplete="off" /></Field>
          </AjaxForm>
        </div>)}
    </div>
  );
}
