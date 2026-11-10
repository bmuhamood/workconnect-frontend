import Link from "next/link";
import type { Metadata } from "next";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { Briefcase, FileText, Users, Wallet, Plus } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { jobs, applications, contracts, invoices, memberships, workerProfiles } from "@/db/schema";
import { PageHeader, Stat, LinkButton, StatusBadge, Empty } from "@/components/ui";
import { ugx, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };
export default async function Dashboard() {
  const s = await requireSession();
  const d = await tdb(async (tx) => {
    if (s.role === "worker") {
      const apps = await tx.select({ a: applications, title: jobs.title, jid: jobs.id }).from(applications).innerJoin(jobs, eq(jobs.id, applications.jobId)).where(eq(applications.workerId, s.userId)).orderBy(desc(applications.createdAt)).limit(8);
      const cs = await tx.select().from(contracts).where(eq(contracts.workerId, s.userId)).orderBy(desc(contracts.createdAt)).limit(5);
      const [p] = await tx.select().from(workerProfiles).where(eq(workerProfiles.userId, s.userId));
      const done = p ? [p.profession, p.bio, p.expectedSalary, p.skills.length, p.experienceYears].filter(Boolean).length * 20 : 0;
      return { kind: "worker" as const, apps, cs, done };
    }
    if (s.role === "employer") {
      const js = await tx.select({ j: jobs, n: sql<number>`(select count(*)::int from applications a where a.job_id = ${jobs.id})` }).from(jobs).where(eq(jobs.employerId, s.userId)).orderBy(desc(jobs.createdAt)).limit(8);
      const cs = await tx.select().from(contracts).where(eq(contracts.employerId, s.userId)).orderBy(desc(contracts.createdAt)).limit(5);
      const [due] = await tx.select({ n: count(), t: sql<number>`coalesce(sum(total),0)::int` }).from(invoices).where(and(eq(invoices.employerId, s.userId), eq(invoices.status, "pending")));
      return { kind: "employer" as const, js, cs, due };
    }
    const [m] = await tx.select({ n: count() }).from(memberships);
    const [jb] = await tx.select({ n: count() }).from(jobs);
    const [ac] = await tx.select({ n: count() }).from(contracts).where(eq(contracts.status, "active"));
    const [rev] = await tx.select({ t: sql<number>`coalesce(sum(fee_amount),0)::int` }).from(invoices).where(inArray(invoices.status, ["paid"]));
    return { kind: "admin" as const, m: m.n, jb: jb.n, ac: ac.n, rev: rev.t };
  });
  return (
    <div className="container-x py-10">
      <PageHeader title={`Hello, ${s.name.split(" ")[0]} 👋`} subtitle={`${s.tenantName} · ${s.role}`} action={s.role === "employer" ? <LinkButton href="/post-job"><Plus className="size-4" />Post a job</LinkButton> : s.role === "worker" ? <LinkButton href="/jobs">Browse jobs</LinkButton> : <LinkButton href="/admin">Open admin</LinkButton>} />
      {d.kind === "worker" && <>
        <div className="grid gap-4 sm:grid-cols-3"><Stat label="Applications" value={d.apps.length} icon={<Briefcase className="size-4" />} /><Stat label="Contracts" value={d.cs.length} icon={<FileText className="size-4" />} /><Stat label="Profile complete" value={`${d.done}%`} /></div>
        {d.done < 100 && <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50 p-5"><p className="text-sm text-accent-strong">Complete your profile to get noticed by employers.</p><LinkButton href="/profile" size="sm">Update profile</LinkButton></div>}
        <h2 className="mb-3 mt-10 text-lg font-bold">My applications</h2>
        {d.apps.length === 0 ? <Empty title="No applications yet" action={<LinkButton href="/jobs">Find a job</LinkButton>} /> : <div className="card divide-y divide-slate-100">{d.apps.map(({ a, title, jid }) => <Link key={a.id} href={`/jobs/${jid}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><div><div className="font-medium">{title}</div><div className="text-xs text-slate-400">Applied {timeAgo(a.createdAt)}</div></div><StatusBadge status={a.status} /></Link>)}</div>}
        <ContractList cs={d.cs} />
      </>}
      {d.kind === "employer" && <>
        <div className="grid gap-4 sm:grid-cols-3"><Stat label="Open jobs" value={d.js.filter((x) => x.j.status === "open").length} icon={<Briefcase className="size-4" />} /><Stat label="Contracts" value={d.cs.length} icon={<FileText className="size-4" />} /><Stat label="Invoices due" value={d.due.n ? ugx(d.due.t) : "None"} icon={<Wallet className="size-4" />} /></div>
        <h2 className="mb-3 mt-10 text-lg font-bold">My jobs</h2>
        {d.js.length === 0 ? <Empty title="You haven't posted a job" action={<LinkButton href="/post-job">Post your first job</LinkButton>} /> : <div className="card divide-y divide-slate-100">{d.js.map(({ j, n }) => <Link key={j.id} href={`/jobs/${j.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><div><div className="font-medium">{j.title}</div><div className="text-xs text-slate-400">{n} applicant{n === 1 ? "" : "s"} · {timeAgo(j.createdAt)}</div></div><StatusBadge status={j.status} /></Link>)}</div>}
        <ContractList cs={d.cs} />
      </>}
      {d.kind === "admin" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Members" value={d.m} icon={<Users className="size-4" />} /><Stat label="Jobs" value={d.jb} icon={<Briefcase className="size-4" />} /><Stat label="Active contracts" value={d.ac} icon={<FileText className="size-4" />} /><Stat label="Fees collected" value={ugx(d.rev)} icon={<Wallet className="size-4" />} /></div>}
    </div>
  );
}
function ContractList({ cs }: { cs: { id: string; title: string; status: string; salary: number }[] }) {
  if (!cs.length) return null;
  return <><h2 className="mb-3 mt-10 text-lg font-bold">Recent contracts</h2><div className="card divide-y divide-slate-100">{cs.map((c) => <Link key={c.id} href={`/contracts/${c.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><div><div className="font-medium">{c.title}</div><div className="text-xs text-slate-400">{ugx(c.salary)}/month</div></div><StatusBadge status={c.status} /></Link>)}</div></>;
}
