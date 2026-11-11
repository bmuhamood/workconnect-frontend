import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { AUTH_MODE, DEMO_LOGIN, SHOW_DEMO_ACCOUNTS } from "@/lib/auth-mode";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ suspended?: string }> }) {
  const sp = await searchParams;
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="card w-full max-w-xl p-8 animate-rise">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-slate-600">Sign in to manage jobs, employees, contracts and payroll.</p>
        {sp.suspended === "1" && <p role="alert" className="mb-4 rounded-lg border border-amber-600/40 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">Your organisation is currently suspended. Please contact the platform administrator.</p>}
        <LoginForm mode={AUTH_MODE} demo={DEMO_LOGIN} showDemo={SHOW_DEMO_ACCOUNTS} />
      </div>
    </div>
  );
}
