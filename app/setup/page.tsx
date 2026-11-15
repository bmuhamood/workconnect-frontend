import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { users } from "@/db/schema";
import { SetupForm } from "@/components/auth-forms";
import { AUTH_MODE } from "@/lib/auth-mode";
import { getIdentity } from "@/lib/identity";

export const metadata: Metadata = { title: "Platform setup", robots: { index: false } };
/** Only reachable while PLATFORM_SETUP_TOKEN is set and no Super Admin exists yet. */
export default async function Setup() {
  if (!process.env.PLATFORM_SETUP_TOKEN) notFound();
  if ((await rootDb.select({ id: users.id }).from(users).where(eq(users.isSuperAdmin, true)).limit(1)).length) redirect("/login");
  const id = await getIdentity();
  return (
    <div className="container-x grid place-items-center py-14"><div className="card w-full max-w-xl p-8">
      <h1 className="text-2xl font-bold tracking-tight">Create the Super WorkConnect Admin</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">One-time setup. You'll need the PLATFORM_SETUP_TOKEN from your deployment settings. After this account exists, this page closes.</p>
      <SetupForm mode={AUTH_MODE} finish={!!id} email={id?.email} />
    </div></div>
  );
}
