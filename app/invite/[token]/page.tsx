import type { Metadata } from "next";
import Link from "next/link";
import { and, eq, isNull } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { invitations, tenants } from "@/db/schema";
import { InviteForm } from "@/components/auth-forms";
import { AUTH_MODE } from "@/lib/auth-mode";
import { getIdentity } from "@/lib/identity";
import { hashToken, ROLE_LABEL } from "@/lib/invitations";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "Accept your invitation", robots: { index: false } };
const Shell = ({ children }: { children: React.ReactNode }) => <div className="container-x grid place-items-center py-14"><div className="card w-full max-w-xl p-8 animate-rise">{children}</div></div>;

export default async function Invite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [inv] = await rootDb.select().from(invitations).where(eq(invitations.tokenHash, hashToken(token))).limit(1);
  const bad = !inv || inv.revokedAt || inv.acceptedAt || inv.expiresAt < new Date();
  if (bad) return (
    <Shell><h1 className="text-2xl font-bold">This invitation can't be used</h1><p className="mt-3 text-slate-600">It may have expired, been used already, or been replaced by a newer one. Ask for a fresh invitation. If you already have an account, you can sign in.</p><div className="mt-6"><LinkButton href="/login">Go to sign in</LinkButton></div></Shell>);
  const [t] = inv.tenantId ? await rootDb.select().from(tenants).where(and(eq(tenants.id, inv.tenantId), isNull(tenants.suspendedAt))).limit(1) : [undefined];
  if (inv.kind === "member" && !t) return <Shell><h1 className="text-2xl font-bold">This workspace isn't active</h1><p className="mt-3 text-slate-600">Please contact WorkConnect.</p></Shell>;
  const id = await getIdentity();
  if (id && id.email.toLowerCase() !== inv.email.toLowerCase()) return (
    <Shell><h1 className="text-2xl font-bold">Wrong account</h1><p className="mt-3 text-slate-600">This invitation was sent to <b>{inv.email}</b>, but you're signed in as <b>{id.email}</b>. Sign out, then open the link again.</p><div className="mt-6"><Link href="/login" className="text-accent underline">Switch account</Link></div></Shell>);
  const staff = inv.kind === "staff";
  return (
    <Shell>
      <h1 className="text-2xl font-bold tracking-tight">{staff ? "Join the WorkConnect team" : `Join ${t!.name}`}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Create your account to continue. This invitation is personal to {inv.email}.</p>
      <InviteForm mode={AUTH_MODE} token={token} email={inv.email} firstName={inv.firstName ?? undefined} role={inv.role ?? "worker"} roleLabel={ROLE_LABEL[inv.role ?? "worker"] ?? ""} org={t?.name} staff={staff} finish={!!id} />
    </Shell>
  );
}
