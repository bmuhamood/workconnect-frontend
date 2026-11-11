import type { Metadata } from "next";
import { Users, FileSignature, Wallet, CalendarDays, Activity, Headset, Check } from "lucide-react";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "Services", description: "Recruitment, employee management, payroll, leave, monitoring and HR support." };
const SERVICES = [
  { Icon: Users, title: "Manpower sourcing & recruitment", lead: "Sourcing, screening, interviewing and placing qualified candidates.", points: ["Role scoping and job briefs", "Sourcing from a verified talent network", "Screening, interviews and ranked shortlists", "ID and reference checks", "Offers, contracts and placement"] },
  { Icon: FileSignature, title: "Employee management", lead: "Onboarding, employment contracts, employee records and HR administration.", points: ["Digital contracts signed by both parties", "A complete record for every employee", "Onboarding checklists", "Role, salary and start-date history", "Contract completion and termination handled properly"] },
  { Icon: Wallet, title: "Payroll & payments", lead: "Salary processing, payroll administration and employee payments.", points: ["Monthly payroll runs for every employee", "PAYE, NSSF and unpaid-leave deductions", "Allowances and other deductions", "Printable payslips and CSV export", "Invoices with mobile-money, card and bank payment"] },
  { Icon: CalendarDays, title: "Leave management", lead: "Annual leave, sick leave and other entitlements, kept in order.", points: ["Entitlements for each leave type", "Requests, approvals and live balances", "A calendar showing who's off", "Overlap and balance checks", "Unpaid leave flows straight into payroll"] },
  { Icon: Activity, title: "Employee monitoring", lead: "Attendance, performance, productivity and conduct in one view.", points: ["One-tap clock in and out", "Lateness flagged against working hours", "Daily and per-employee attendance", "Manager corrections with a record", "Reviews and ratings after each engagement"] },
  { Icon: Headset, title: "HR administration & support", lead: "Ongoing HR support and management of employee-related processes.", points: ["A helpdesk for payroll, leave and contract questions", "Threaded replies with email updates", "Policies and handbooks (Full HR Outsourcing)", "Compliance reviews and reporting", "A named HR consultant (Full HR Outsourcing)"] },
];
export default function Services() {
  return (
    <div className="container-x py-14 sm:py-20">
      <div className="max-w-2xl"><h1 className="text-3xl font-bold sm:text-5xl">Services</h1><p className="mt-5 text-lg leading-relaxed text-slate-600">Everything between "we need someone" and "they're on payroll", delivered as one connected service.</p></div>
      <div className="mt-14 grid gap-5 md:grid-cols-2">{SERVICES.map(({ Icon, title, lead, points }) => (
        <article key={title} className="card p-7"><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand"><Icon className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-slate-600">{lead}</p>
          <ul className="mt-5 space-y-2.5 text-sm">{points.map((p) => <li key={p} className="flex gap-3 text-slate-700"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-signal/15 text-signal"><Check className="size-3" /></span>{p}</li>)}</ul></article>))}</div>
      <section className="card mt-16 flex flex-wrap items-center justify-between gap-6 p-8 sm:p-10"><div><h2 className="text-2xl font-bold">Which services do you need?</h2><p className="mt-2 text-slate-600">See how they fit together in our packages, or talk to us.</p></div><div className="flex gap-3"><LinkButton href="/packages" variant="secondary" size="lg">View packages</LinkButton><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton></div></section>
    </div>
  );
}
