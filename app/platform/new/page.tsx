import type { Metadata } from "next";
import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/session";
import { NewClientForm } from "@/components/platform-client-forms";

export const metadata: Metadata = { title: "Add a client" };
export default async function NewClient() {
  await requirePlatformAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/platform" className="text-sm text-slate-600 hover:text-slate-900">← All clients</Link>
      <h2 className="mb-2 mt-3 text-2xl font-bold">Add a client organisation</h2>
      <p className="mb-6 text-slate-600">This creates the client's private workspace and invites its administrator. Nothing in it is visible to any other client.</p>
      <div className="card p-6"><NewClientForm /></div>
    </div>
  );
}
