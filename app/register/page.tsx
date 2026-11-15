import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getStaff } from "@/lib/session";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "Accounts are by invitation" };
export default async function Register() {
  if (await getSession()) redirect("/dashboard");
  if (await getStaff()) redirect("/platform");
  return (
    <div className="container-x grid place-items-center py-16">
      <div className="card w-full max-w-xl p-8 animate-rise">
        <h1 className="text-2xl font-bold tracking-tight">Accounts are created by invitation</h1>
        <p className="mt-3 leading-relaxed text-slate-600">WorkConnect sets up each client organisation, and your administrator invites you. Open the invitation link in your email to create your account.</p>
        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          <li><b>Your organisation is new to WorkConnect?</b> <Link href="/contact?topic=consultation" className="text-accent underline">Book a consultation</Link> and we'll set up your private workspace.</li>
          <li><b>Invitation expired or lost?</b> Ask your administrator to send a new one.</li>
        </ul>
        <div className="mt-7 flex flex-wrap gap-3"><LinkButton href="/login">Client login</LinkButton><LinkButton href="/contact?topic=consultation" variant="secondary">Book a consultation</LinkButton></div>
      </div>
    </div>
  );
}
