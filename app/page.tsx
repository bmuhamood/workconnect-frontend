import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { categories, jobs, workerProfiles, users } from "@/db/schema";
import { LinkButton, Avatar, Stars, Badge } from "@/components/ui";
import { MatchNetwork } from "@/components/match-network";
import { ServicesExplorer } from "@/components/services-explorer";
import { RolesMarquee } from "@/components/roles-marquee";
import { ugxRange, rating } from "@/lib/format";

const STEPS = [
  ["Post the role", "Describe the work, hours and monthly pay. It's visible to workers in your organisation right away."],
  ["Review verified applicants", "See experience, ratings and past reviews side by side. Shortlist, message, or decline."],
  ["Sign digitally", "Send a contract offer. It becomes active the moment both of you have signed."],
  ["Pay monthly", "An invoice is created for each active contract. Pay by mobile money, card or bank."],
];

export default async function Home() {
  const data = await tdb(async (tx, tenant) => {
    const [stat] = await tx.select({ workers: sql<number>`count(*)::int`, verified: sql<number>`count(*) filter (where verified)::int` }).from(workerProfiles);
    const [open] = await tx.select({ n: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.status, "open"));
    return {
      tenant, stat, open: open.n,
      cats: await tx.select().from(categories).orderBy(categories.name),
      workers: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, avatar: users.avatarUrl, p: workerProfiles }).from(workerProfiles).innerJoin(users, eq(users.id, workerProfiles.userId)).orderBy(desc(workerProfiles.verified), desc(workerProfiles.ratingAvg)).limit(7),
      jobs: await tx.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt)).limit(3),
    };
  }).catch(() => null);

  if (!data) return (
    <div className="container-x py-28 text-center">
      <h1 className="font-display text-4xl font-bold">WorkConnect</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-500">No organisation is set up on this site yet. Create the first one to start hiring.</p>
      <div className="mt-7 flex justify-center gap-3"><LinkButton href="/register" size="lg">Create your organisation</LinkButton><LinkButton href="/api/health" variant="secondary" size="lg">Check setup</LinkButton></div>
    </div>
  );

  const net = data.workers.map((w) => ({ name: `${w.first} ${w.last}`, role: w.p.profession || "Worker", verified: w.p.verified }));
  return (
    <>
      <section className="container-x grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
        <div className="animate-rise">
          <Badge tone="blue" className="mb-6"><span className="size-1.5 rounded-full bg-signal" />{data.tenant.name}</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] sm:text-6xl">Hire people you can trust. We handle the paperwork.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Recruitment and workforce management in one place: sourcing, contracts, payroll, leave and ongoing HR support.</p>
          <form action="/workers" className="card mt-9 flex max-w-lg items-center gap-2 p-2">
            <Search className="ml-3 size-5 shrink-0 text-slate-400" />
            <input name="q" aria-label="Search workers" placeholder="Try nanny, driver or cook" className="w-full bg-transparent py-2 text-slate-900 outline-none placeholder:text-slate-400" />
            <button className="shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-[#6a4fe6] px-5 py-2.5 text-sm font-semibold text-onbrand">Search</button>
          </form>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div><dt className="text-slate-500">Workers available</dt><dd className="font-display text-2xl font-semibold">{data.stat.workers}</dd></div>
            <div><dt className="text-slate-500">Identity verified</dt><dd className="font-display text-2xl font-semibold text-signal">{data.stat.verified}</dd></div>
            <div><dt className="text-slate-500">Open jobs</dt><dd className="font-display text-2xl font-semibold">{data.open}</dd></div>
          </dl>
        </div>
        <MatchNetwork people={net} />
      </section>

      <section id="services" className="container-x scroll-mt-24 pb-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-4xl">One partner from the first interview to monthly payroll</h2>
          <p className="mt-4 text-slate-600">WorkConnect finds the right people, signs them up properly, pays them on time and keeps the HR side running, so you can focus on your business.</p>
        </div>
        <div className="mt-10"><ServicesExplorer /></div>
      </section>

      <section className="pb-20">
        <div className="container-x mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Whoever you need to hire</h2>
          <p className="mt-3 text-slate-600">General workers, cleaners, drivers, warehouse staff, technicians, supervisors, administrators, accountants, IT professionals, managers and other skilled professionals. We support your recruitment and workforce management needs.</p>
        </div>
        <RolesMarquee />
      </section>

      <section className="container-x pb-20">
        <h2 className="max-w-md text-2xl font-bold sm:text-3xl">From first message to first payslip</h2>
        <ol className="relative mt-10 grid gap-5 md:grid-cols-4">
          <div className="hairline absolute inset-x-0 top-[22px] hidden md:block" />
          {STEPS.map(([t, d], i) => (
            <li key={t} className="relative">
              <span className="relative z-10 grid size-11 place-items-center rounded-full border border-brand-400/50 bg-[#0d1326] font-display text-sm font-semibold text-accent">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{t}</h3><p className="mt-1.5 text-sm leading-relaxed text-slate-500">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-20">
        <div className="flex items-end justify-between gap-4"><h2 className="text-2xl font-bold sm:text-3xl">Top-rated workers</h2><Link href="/workers" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong">See everyone <ArrowRight className="size-4" /></Link></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.workers.slice(0, 4).map((w) => (
            <Link key={w.id} href={`/workers/${w.id}`} className="card p-5">
              <div className="flex items-center gap-3"><Avatar name={`${w.first} ${w.last}`} src={w.avatar} size={46} /><div className="min-w-0"><div className="truncate font-semibold">{w.first} {w.last}</div><div className="truncate text-sm text-slate-500">{w.p.profession}</div></div></div>
              <div className="mt-5 flex items-center justify-between"><Stars value={Number(rating(w.p.ratingAvg))} count={w.p.reviewsCount} />{w.p.verified && <Badge tone="green"><ShieldCheck className="size-3" />Verified</Badge>}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pb-20">
        <h2 className="text-2xl font-bold sm:text-3xl">Browse by category</h2>
        <div className="mt-6 flex flex-wrap gap-2.5">{data.cats.map((c) => <Link key={c.id} href={`/workers?category=${c.id}`} className="rounded-full border border-slate-300/50 bg-slate-100/50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-400 hover:text-slate-900">{c.name}</Link>)}</div>
      </section>

      {data.jobs.length > 0 && (
        <section className="container-x pb-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Open now</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {data.jobs.map((j) => <Link key={j.id} href={`/jobs/${j.id}`} className="card p-5"><div className="font-semibold">{j.title}</div><div className="mt-1 text-sm text-slate-500">{j.location}</div><div className="mt-4 text-sm font-medium text-accent">{ugxRange(j.salaryMin, j.salaryMax)}</div></Link>)}
          </div>
        </section>
      )}

      <section className="container-x pb-4">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Running an agency? Get your own private workspace.</h2>
            <p className="mt-3 text-slate-600">Your workers, employers, contracts and emails live in a space no other organisation can see, with your name and colours on every message.</p>
            <div className="mt-6 flex flex-wrap gap-3"><LinkButton href="/register" size="lg">Create your workspace</LinkButton><LinkButton href="/help" variant="secondary" size="lg">How it works</LinkButton></div>
          </div>
        </div>
      </section>
    </>
  );
}
