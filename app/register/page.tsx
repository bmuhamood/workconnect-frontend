import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { AUTH_MODE } from "@/lib/auth-mode";
import { getIdentity } from "@/lib/identity";
import { getSession } from "@/lib/session";
import { currentTenant } from "@/lib/tenant";

export const metadata: Metadata = { title: "Create your account" };
export default async function Register({ searchParams }: { searchParams: Promise<{ finish?: string; as?: string }> }) {
  if (await getSession()) redirect("/dashboard");
  const id = await getIdentity();
  const tenant = await currentTenant();
  const sp = await searchParams;
  return (
    <div className="container-x grid place-items-center py-12">
      <div className="card w-full max-w-xl p-8 animate-rise">
        <h1 className="text-2xl font-bold tracking-tight">{id ? "Finish setting up" : sp.as === "organisation" ? "Register your HR firm" : "Create your account"}</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">It takes about a minute. We'll email you a confirmation.</p>
        <RegisterForm mode={AUTH_MODE} tenantName={tenant?.name ?? null} finish={!!id || sp.finish === "1"} identityEmail={id?.email} preselect={sp.as === "organisation" ? "agency" : undefined} />
      </div>
    </div>
  );
}
