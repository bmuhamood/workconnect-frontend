import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, ShieldCheck, FileSignature, Wallet, Star, Search } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { categories, jobs, workerProfiles, users } from "@/db/schema";
import { LinkButton, Avatar, Stars, Badge } from "@/components/ui";
import { ugxRange, rating } from "@/lib/format";

export default async function Home() {
  const data = await tdb(async (tx, tenant) => ({
    tenant,
    cats: await tx.select().from(categories).orderBy(categories.name),
    workers: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, p: workerProfiles }).from(workerProfiles).innerJoin(users, eq(users.id, workerProfiles.userId)).orderBy(desc(workerProfiles.verified), desc(workerProfiles.ratingAvg)).limit(4),
    jobs: await tx.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt)).limit(3),
    stats: (await tx.select({ w: sql<number>`count(*)::int` }).from(workerProfiles))[0],
  })).catch(() => null);

  if (!data) return (
    <div className="container-x py-24 text-center"><h1 className="text-3xl font-bold">WorkConnect</h1><p className="mt-3 text-slate-500">No organisation is set up yet.</p><div className="mt-6"><LinkButton href="/register">Create your organisation</LinkButton></div></div>
  );
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="container-x py-20 text-center sm:py-28">
          <Badge tone="blue" className="mb-5">{data.tenant.name}</Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">Hire <span className="gradient-text">trusted workers</span> you can rely on</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">Verified house help, nannies, drivers and cooks — with digital contracts, monthly invoicing and reviews built in.</p>
          <form action="/workers" className="mx-auto mt-9 flex max-w-xl gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-brand-600/5">
            <div className="flex flex-1 items-center gap-2 px-3"><Search className="size-5 text-slate-400" /><input name="q" placeholder="Nanny, driver, cook…" className="w-full bg-transparent py-2 outline-none placeholder:text-slate-400" /></div>
            <button className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><LinkButton href="/register" size="lg">Get started free <ArrowRight className="size-4" /></LinkButton><LinkButton href="/jobs" variant="secondary" size="lg">Browse jobs</LinkButton></div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.cats.map((c) => <Link key={c.id} href={`/workers?category=${c.id}`} className="card p-4 text-sm font-medium transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">{c.name}</Link>)}
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="flex items-end justify-between"><h2 className="text-2xl font-bold tracking-tight">Top-rated workers</h2><Link href="/workers" className="text-sm font-medium text-brand-600 hover:underline">View all</Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.workers.map((w) => (
            <Link key={w.id} href={`/workers/${w.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3"><Avatar name={`${w.first} ${w.last}`} size={44} /><div><div className="font-semibold">{w.first} {w.last}</div><div className="text-sm text-slate-500">{w.p.profession}</div></div></div>
              <div className="mt-4 flex items-center justify-between"><Stars value={Number(rating(w.p.ratingAvg))} count={w.p.reviewsCount} />{w.p.verified && <Badge tone="green"><ShieldCheck className="size-3" />Verified</Badge>}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="container-x grid gap-8 sm:grid-cols-3">
          {[[ShieldCheck, "Verified profiles", "Admins verify identity and experience before a worker earns the badge."], [FileSignature, "Digital contracts", "Offer, sign and manage employment contracts without paperwork."], [Wallet, "Simple payments", "Monthly invoices with mobile money and card options, tracked in one place."]].map(([I, t, d]) => {
            const Icon = I as typeof Star;
            return <div key={t as string}><div className="mb-3 grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="size-5" /></div><h3 className="font-semibold">{t as string}</h3><p className="mt-1 text-sm text-slate-500">{d as string}</p></div>;
          })}
        </div>
      </section>

      {data.jobs.length > 0 && (
        <section className="container-x py-16">
          <h2 className="text-2xl font-bold tracking-tight">Latest jobs</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.jobs.map((j) => <Link key={j.id} href={`/jobs/${j.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="font-semibold">{j.title}</div><div className="mt-1 text-sm text-slate-500">{j.location}</div><div className="mt-3 text-sm font-medium text-brand-700">{ugxRange(j.salaryMin, j.salaryMax)}</div></Link>)}
          </div>
        </section>
      )}
    </>
  );
}
