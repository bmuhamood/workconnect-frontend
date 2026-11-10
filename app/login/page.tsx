import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";
import { AUTH_MODE } from "@/lib/auth-mode";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };
export default async function Login() {
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-12">
      <div className="card w-full max-w-md p-8 animate-rise">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Sign in to manage jobs, contracts and payments.</p>
        <LoginForm mode={AUTH_MODE} />
      </div>
    </div>
  );
}
