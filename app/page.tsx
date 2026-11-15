import Link from "next/link";
import { ArrowRight, ShieldCheck, FileSignature, Wallet, CalendarCheck, Clock, LifeBuoy, Lock, Landmark, Smartphone, Building2, Check, Handshake } from "lucide-react";
import { LinkButton, Badge } from "@/components/ui";
import { OpsPreview } from "@/components/ops-preview";
import { ServicesExplorer } from "@/components/services-explorer";
import { RolesMarquee } from "@/components/roles-marquee";
import { PackagesGrid } from "@/components/packages-grid";
import { Faq } from "@/components/faq";
import { getPlatformPackages, publicStats } from "@/lib/platform";
import { COMPANY, RECRUITMENT_STEPS, PERSONNEL, HR_OUTSOURCING, TRAINING, WHY_US, INDUSTRIES, PARTNERS, GLOBIS } from "@/lib/company";

const MODULES = [
  { Icon: Wallet, title: "Payroll", text: "Monthly runs with PAYE, NSSF and unpaid-leave deductions, allowances, review and approval, printable payslips and CSV export.", span: "lg:col-span-2" },
  { Icon: CalendarCheck, title: "Leave management", text: "Entitlements by leave type, requests and approvals, live balances and a team calendar of who's off.", span: "" },
  { Icon: Clock, title: "Attendance & overtime", text: "One-tap clock in and out. Lateness and overtime are measured against the exact working hours in each employee's contract, approved by the client and paid through payroll.", span: "" },
  { Icon: LifeBuoy, title: "HR helpdesk", text: "Staff raise payroll, leave and contract questions. HR answers in one threaded place, with email updates.", span: "lg:col-span-2" },
];
const TRUST = [[Lock, "Private workspace per client", "Each client's data is isolated at database level"], [Landmark, "PAYE & NSSF aware", "Rates you confirm before payroll is approved"], [FileSignature, "Digital contracts", "Offer, e-sign and activate without paperwork"], [Smartphone, "Mobile money", "MTN MoMo and Airtel Money supported"]] as const;

export default async function Home() {
  // The public site is WorkConnect's own. It reads only WorkConnect's packages and aggregate counts, never client data,
  // and never fails if the database is empty or unreachable.
  const [packages, stats] = await Promise.all([getPlatformPackages().catch(() => []), publicStats().catch(() => null)]);
  const facts: [string, number][] = stats ? ([["Client organisations", stats.clients], ["Employees under management", stats.employees]] as [string, number][]).filter(([, n]) => n > 0) : [];
  return (
    <>
      <section className="container-x grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
        <div className="animate-rise">
          <Badge tone="blue" className="mb-6"><span className="size-1.5 rounded-full bg-signal" />{COMPANY.name} · Uganda</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] sm:text-6xl">{COMPANY.tagline}.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">Professionally screened, well-trained people for homes, hotels, schools, hospitals, offices and industry, plus the HR outsourcing, payroll and workforce management to keep them working well.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <LinkButton href="/contact?topic=consultation" size="lg">Book a consultation <ArrowRight className="size-4" aria-hidden="true" /></LinkButton>
            <LinkButton href="/packages" variant="secondary" size="lg">View packages</LinkButton>
            <LinkButton href="/login" variant="ghost" size="lg"><Building2 className="size-4" aria-hidden="true" />Client login</LinkButton>
          </div>
          {facts.length > 0 && <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm">{facts.map(([k, v]) => <div key={k}><dd className="font-display text-2xl font-semibold">{v}</dd><dt className="text-slate-500">{k}</dt></div>)}</dl>}
        </div>
        <OpsPreview />
      </section>

      <section aria-label="Why it is safe" className="border-y border-slate-200 bg-slate-100/40">
        <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">{TRUST.map(([Icon, t, d]) => <div key={t} className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-400/40 bg-brand-50 text-accent"><Icon className="size-5" aria-hidden="true" /></span><div><div className="font-semibold">{t}</div><div className="text-sm text-slate-500">{d}</div></div></div>)}</div>
      </section>

      <section id="about" className="container-x scroll-mt-24 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div><h2 className="text-2xl font-bold sm:text-4xl">Who we are</h2><div className="mt-5 space-y-4 text-slate-600">{COMPANY.about.map((t) => <p key={t}>{t}</p>)}</div>
            <div className="mt-6"><Link href="/about" className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-strong">Our vision, mission and values <ArrowRight className="size-4" aria-hidden="true" /></Link></div></div>
          <div className="grid gap-4">
            <div className="card p-6"><h3 className="font-semibold">Vision</h3><p className="mt-2 text-slate-600">{COMPANY.vision}</p></div>
            <div className="card p-6"><h3 className="font-semibold">Mission</h3><p className="mt-2 text-slate-600">{COMPANY.mission}</p></div>
          </div>
        </div>
      </section>

      <section id="services" className="container-x scroll-mt-24 pb-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">Recruitment, HR outsourcing and training in one place</h2><p className="mt-4 text-slate-600">We find the right people, prepare them for the workplace, sign them up properly, pay them on time and keep the HR side running.</p></div>
        <div className="mt-10"><ServicesExplorer /></div>
        <div className="mt-8"><Link href="/services" className="inline-flex items-center gap-1 font-medium text-accent hover:text-accent-strong">See every service in detail <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      </section>

      <section className="container-x pb-20">
        <h2 className="max-w-xl text-2xl font-bold sm:text-3xl">Our recruitment process</h2>
        <p className="mt-3 max-w-2xl text-slate-600">Every candidate passes through a structured ten-step process before they reach you.</p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{RECRUITMENT_STEPS.map((t, i) => <li key={t} className="card flex items-start gap-3 p-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-sm font-bold text-onbrand">{i + 1}</span><span className="pt-1 text-sm font-medium">{t}</span></li>)}</ol>
      </section>

      <section id="personnel" className="container-x scroll-mt-24 pb-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-3xl">Personnel we supply</h2><p className="mt-3 text-slate-600">Permanent, temporary, contract and casual staff across many sectors, and other skilled and semi-skilled roles on request.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PERSONNEL.map((g) => <div key={g.sector} className="card p-5"><h3 className="font-semibold">{g.sector}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{g.roles.join(" · ")}</p></div>)}</div>
        <div className="mt-8 overflow-hidden"><RolesMarquee /></div>
      </section>

      <section className="container-x pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-7"><h2 className="text-xl font-bold">HR outsourcing</h2><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{HR_OUTSOURCING.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />{t}</li>)}</ul></div>
          <div className="card p-7"><h2 className="text-xl font-bold">Workforce training before deployment</h2><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{TRAINING.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />{t}</li>)}</ul></div>
        </div>
      </section>

      <section id="workspace" className="container-x scroll-mt-24 pb-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div><h2 className="text-2xl font-bold sm:text-4xl">Every client gets a private workspace</h2>
            <p className="mt-4 leading-relaxed text-slate-600">We run HR for many organisations at once, and each one's information stays completely separate. Your employees, contracts, payroll, leave and attendance live in your own space. No other client can ever see them, and we can't mix them up.</p>
            <ul className="mt-6 space-y-3 text-slate-700">{["Separate data for every client, enforced in the database itself", "Your administrator invites your managers and employees", "Managers see only their own team; employees see only their own records", "When a WorkConnect consultant works in your space, you can see it and it is logged"].map((t) => <li key={t} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" /><span>{t}</span></li>)}</ul></div>
          <div className="card divide-y divide-slate-200 text-sm">{[["Your administrator", "Sets up the workspace, invites people, approves, and sees everything in your organisation"], ["Your managers", "Monitor and approve for their own employees only"], ["Your employees", "Clock in, request leave, read payslips and raise HR questions"], ["WorkConnect consultants", "Deliver payroll, recruitment and HR support inside your workspace, with a visible record"]].map(([t, d]) => <div key={t} className="flex gap-4 p-5"><span className="mt-0.5 size-2.5 shrink-0 rounded-full bg-signal" aria-hidden="true" /><div><div className="font-semibold">{t}</div><div className="mt-0.5 text-slate-600">{d}</div></div></div>)}</div>
        </div>
      </section>

      {packages.length > 0 && (
        <section id="packages" className="container-x scroll-mt-24 pb-20">
          <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">Packages that grow with your team</h2><p className="mt-4 text-slate-600">Start with recruitment, add workforce management, or hand over HR entirely. Every package is quoted to your headcount and scope.</p></div>
          <div className="mt-12"><PackagesGrid packages={packages} /></div>
        </section>)}

      <section className="container-x pb-20">
        <div className="max-w-2xl"><h2 className="text-2xl font-bold sm:text-4xl">HR operations, on one platform</h2><p className="mt-4 text-slate-600">Each client company gets its own login to monitor its employees, approve leave and overtime, and terminate contracts. Your HR consultancy sees everything across all clients.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">{MODULES.map(({ Icon, title, text, span }) => (
          <div key={title} className={`card p-7 ${span}`}><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-onbrand"><Icon className="size-5" aria-hidden="true" /></span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 max-w-xl leading-relaxed text-slate-600">{text}</p></div>))}</div>
      </section>

      <section className="container-x pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div><h2 className="text-2xl font-bold sm:text-3xl">Why choose {COMPANY.name}?</h2><ul className="mt-6 grid gap-3 text-slate-700 sm:grid-cols-2">{WHY_US.map((t) => <li key={t} className="flex gap-2"><Check className="mt-1 size-4 shrink-0 text-signal" aria-hidden="true" />{t}</li>)}</ul></div>
          <div><h2 className="text-2xl font-bold sm:text-3xl">Industries we serve</h2><ul className="mt-6 flex flex-wrap gap-2">{INDUSTRIES.map((t) => <li key={t} className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700">{t}</li>)}</ul></div>
        </div>
      </section>

      <section id="partners" className="container-x scroll-mt-24 pb-20">
        <div className="card grid gap-8 p-8 sm:p-10 lg:grid-cols-2">
          <div><span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-onbrand"><Handshake className="size-5" aria-hidden="true" /></span><h2 className="mt-5 text-2xl font-bold">Partnerships</h2><p className="mt-3 text-slate-600">{GLOBIS.text}</p><ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">{GLOBIS.benefits.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />{t}</li>)}</ul></div>
          <div><h3 className="font-semibold">We welcome strategic partnerships with</h3><ul className="mt-4 flex flex-wrap gap-2">{PARTNERS.map((t) => <li key={t} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">{t}</li>)}</ul>
            <div className="mt-6"><LinkButton href="/contact?topic=partnership" variant="secondary">Talk to us about a partnership</LinkButton></div></div>
        </div>
      </section>

      <section className="container-x pb-20"><h2 className="mb-8 text-2xl font-bold sm:text-3xl">Questions we're often asked</h2><Faq /></section>

      <section className="container-x pb-4">
        <div className="card relative overflow-hidden p-8 sm:p-14">
          <div className="relative max-w-2xl"><h2 className="text-3xl font-bold sm:text-4xl">Whether you need one employee or an entire workforce.</h2><p className="mt-4 text-lg text-slate-600">{COMPANY.commitment}</p>
            <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton><LinkButton href="/packages" variant="secondary" size="lg">Compare packages</LinkButton><LinkButton href="/login" variant="ghost" size="lg">Client login</LinkButton></div></div></div>
      </section>
    </>
  );
}
