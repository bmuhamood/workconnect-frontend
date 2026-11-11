import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ArrowRight, ShieldCheck, FileSignature, Wallet, CalendarCheck, Clock, LifeBuoy, Lock, Landmark, Smartphone } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { categories, jobs, workerProfiles, users, contracts } from "@/db/schema";
import { LinkButton, Avatar, Stars, Badge } from "@/components/ui";
import { OpsPreview } from "@/components/ops-preview";
import { ServicesExplorer } from "@/components/services-explorer";
import { RolesMarquee } from "@/components/roles-marquee";
import { PackagesGrid } from "@/components/packages-grid";
import { Faq } from "@/components/faq";
import { getPackages } from "@/lib/packages";
import { ugxRange, rating } from "@/lib/format";

const PROCESS = [
  ["Discover", "A short consultation to understand your people, your roles and where HR is costing you time."],
  ["Design", "We scope the right package, set up your workspace, policies, leave rules and payroll settings."],
  ["Deploy", "Recruitment starts, contracts are signed digitally and your first payroll run is prepared."],
  ["Support", "Monthly payroll, leave, attendance and an HR helpdesk your staff can use every day."],
];
const MODULES = [
  { Icon: Wallet, title: "Payroll", text: "Monthly runs with PAYE, NSSF and unpaid-leave deductions, allowances, review and approval, printable payslips and CSV export.", span: "lg:col-span-2" },
  { Icon: CalendarCheck, title: "Leave management", text: "Entitlements by leave type, requests and approvals, live balances and a team calendar of who's off.", span: "" },
  { Icon: Clock, title: "Attendance", text: "One-tap clock in and out, lateness flagged against your working hours, daily and per-employee views.", span: "" },
  { Icon: LifeBuoy, title: "HR helpdesk", text: "Staff raise payroll, leave and contract questions. HR answers in one threaded place, with email updates.", span: "lg:col-span-2" },
];
const TRUST = [[Lock, "Private workspace", "Each client's data is isolated at database level"], [Landmark, "PAYE & NSSF aware", "Rates you confirm before payroll is approved"], [FileSignature, "Digital contracts", "Offer, e-sign and activate without paperwork"], [Smartphone, "Mobile money", "MTN MoMo and Airtel Money supported"]] as const;

export default async function Home() {
  const data = await tdb(async (tx, tenant) => {
    const [pool] = await tx.select({ workers: sql<number>`count(*)::int`, verified: sql<number>`count(*) filter (where verified)::int` }).from(workerProfiles);
    const [live] = await tx.select({ n: sql<number>`count(*)::int` }).from(contracts).where(eq(contracts.status, "active"));
    const [open] = await tx.select({ n: sql<number>`count(*)::int` }).from(jobs).where(eq(jobs.status, "open"));
    return {
      tenant, pool, live: live.n, open: open.n, packages: await getPackages(tx), cats: await tx.select().from(categories).orderBy(categories.name),
      workers: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, avatar: users.avatarUrl, p: workerProfiles }).from(workerProfiles).innerJoin(users, eq(users.id, workerProfiles.userId)).orderBy(desc(workerProfiles.verified), desc(workerProfiles.ratingAvg)).limit(4),
      jobs: await tx.select().from(jobs).where(eq(jobs.status, "open")).orderBy(desc(jobs.createdAt)).limit(3),
    };
  }).catch(() => null);

  if (!data) return (
    <div className="container-x py-28 text-center">
      <h1 className="font-display text-4xl font-bold">WorkConnect</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-500">HR consulting and workforce management. This site isn't set up yet. Create the first organisation to begin.</p>
      <div className="mt-7 flex justify-center gap-3"><LinkButton href="/register" size="lg">Create your organisation</LinkButton><LinkButton href="/api/health" variant="secondary" size="lg">Check setup</LinkButton></div>
    </div>
  );
  const facts: [string, number][] = [["Employees under management", data.live], ["Verified candidates", data.pool.verified], ["Roles open now", data.open]];
  return (
    <>
      <section className="container-x grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
        <div className="animate-rise">
          <Badge tone="blue" className="mb-6"><span className="size-1.5 rounded-full bg-signal" />{data.tenant.name} · HR consulting</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] sm:text-6xl">HR consulting and workforce management, run properly.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Recruitment, contracts, payroll, leave and everyday HR support for growing businesses, delivered by one accountable partner.</p>
          <div className="mt-9 flex flex-wrap gap-3"><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation <ArrowRight className="size-4" /></LinkButton><LinkButton href="/packages" variant="secondary" size="lg">View packages</LinkButton></div>
          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">{facts.map(([k, v]) => <div key={k}><dd className="font-display text-2xl font-semibold">{v}</dd><dt className="text-slate-500">{k}</dt></div>)}</dl>
        </div>
        <OpsPreview />
      </section>

      <section className="border-y border-slate-200/70 bg-slate-100/20">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">{TRUST.map(([Icon, t, d]) => <div key={t} className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-400/40 bg-brand-50 text-accent"><Icon className="size-5" /></span><div><div className="font-semibold">{t}</div><div className="text-sm text-slate-500">{d}</div></div></div>)}</div>
      </section>

      <section id="services" className="container-x scroll-mt-24 py-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">One partner from the first interview to monthly payroll</h2><p className="mt-4 text-slate-600">We find the right people, sign them up properly, pay them on time and keep the HR side running, so you can focus on your business.</p></div>
        <div className="mt-10"><ServicesExplorer /></div>
        <div className="mt-8"><Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong">See every service in detail <ArrowRight className="size-4" /></Link></div>
      </section>

      <section id="packages" className="container-x scroll-mt-24 pb-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">Packages that grow with your team</h2><p className="mt-4 text-slate-600">Start with recruitment, add workforce management, or hand over HR entirely. Every package is quoted to your headcount and scope.</p></div>
        <div className="mt-12"><PackagesGrid packages={data.packages} /></div>
      </section>

      <section className="container-x pb-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">HR operations, in one platform</h2><p className="mt-4 text-slate-600">Your employees and managers get a working system, not a spreadsheet and a phone call.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">{MODULES.map(({ Icon, title, text, span }) => (
          <div key={title} className={`card p-7 ${span}`}><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 max-w-xl leading-relaxed text-slate-600">{text}</p></div>))}</div>
      </section>

      <section className="pb-20">
        <div className="container-x mb-8 max-w-2xl"><h2 className="text-2xl font-bold sm:text-3xl">Whoever you need to hire</h2><p className="mt-3 text-slate-600">General workers, cleaners, drivers, warehouse staff, technicians, supervisors, administrators, accountants, IT professionals, managers and other skilled professionals.</p></div>
        <RolesMarquee />
      </section>

      <section className="container-x pb-20">
        <h2 className="max-w-md text-2xl font-bold sm:text-3xl">How an engagement works</h2>
        <ol className="relative mt-10 grid gap-6 md:grid-cols-4"><div className="hairline absolute inset-x-0 top-[22px] hidden md:block" />
          {PROCESS.map(([t, d], i) => <li key={t} className="relative"><span className="relative z-10 grid size-11 place-items-center rounded-full border border-brand-400/50 bg-[#0d1326] font-display text-sm font-semibold text-accent">{i + 1}</span><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-1.5 text-sm leading-relaxed text-slate-500">{d}</p></li>)}</ol>
      </section>

      <section className="container-x pb-20">
        <div className="flex items-end justify-between gap-4"><h2 className="text-2xl font-bold sm:text-3xl">Our talent network</h2><Link href="/workers" className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong">Browse candidates <ArrowRight className="size-4" /></Link></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.workers.map((w) => (
          <Link key={w.id} href={`/workers/${w.id}`} className="card p-5"><div className="flex items-center gap-3"><Avatar name={`${w.first} ${w.last}`} src={w.avatar} size={46} /><div className="min-w-0"><div className="truncate font-semibold">{w.first} {w.last}</div><div className="truncate text-sm text-slate-500">{w.p.profession}</div></div></div>
            <div className="mt-5 flex items-center justify-between"><Stars value={Number(rating(w.p.ratingAvg))} count={w.p.reviewsCount} />{w.p.verified && <Badge tone="green"><ShieldCheck className="size-3" />Verified</Badge>}</div></Link>))}</div>
        {data.jobs.length > 0 && <div className="mt-6 grid gap-4 md:grid-cols-3">{data.jobs.map((j) => <Link key={j.id} href={`/jobs/${j.id}`} className="card p-5"><div className="font-semibold">{j.title}</div><div className="mt-1 text-sm text-slate-500">{j.location}</div><div className="mt-3 text-sm font-medium text-accent">{ugxRange(j.salaryMin, j.salaryMax)}</div></Link>)}</div>}
      </section>

      <section className="container-x pb-20"><h2 className="mb-8 text-2xl font-bold sm:text-3xl">Questions we're often asked</h2><Faq /></section>

      <section className="container-x pb-4">
        <div className="card relative overflow-hidden p-8 sm:p-14"><div className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative max-w-2xl"><h2 className="text-3xl font-bold sm:text-4xl">Let's review how your HR is run today.</h2><p className="mt-4 text-lg text-slate-600">A short consultation is all it takes to tell you where you can save time, reduce risk and hire better.</p>
            <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton><LinkButton href="/packages" variant="secondary" size="lg">Compare packages</LinkButton></div></div></div>
      </section>
    </>
  );
}
