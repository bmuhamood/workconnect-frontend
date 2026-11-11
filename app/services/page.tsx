import type { Metadata } from "next";
import { Users, FileSignature, Wallet, CalendarDays, Activity, Headset, Check } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { RECRUITMENT_INCLUDES, HR_OUTSOURCING, TRAINING } from "@/lib/company";

export const metadata: Metadata = { title: "Services", description: "Recruitment, employee management, payroll, leave, monitoring and HR support." };
const SERVICES = [
  { Icon: Users, title: "Recruitment & placement", lead: "Permanent, temporary, contract and casual placements across industries.", points: [...RECRUITMENT_INCLUDES] },
  { Icon: FileSignature, title: "HR outsourcing", lead: "Complete end-to-end HR administration, run for you.", points: [...HR_OUTSOURCING] },
  { Icon: Wallet, title: "Payroll & payments", lead: "Salary processing with PAYE, NSSF, unpaid leave and approved overtime.", points: ["Monthly payroll runs for every employee", "PAYE, NSSF and unpaid-leave deductions", "Overtime paid at the rate set in each contract", "Allowances and other deductions", "Printable payslips and CSV export", "Invoices with mobile-money, card and bank payment"] },
  { Icon: CalendarDays, title: "Leave management", lead: "Annual, sick and other entitlements, kept in order.", points: ["Entitlements for each leave type", "Requests, approvals and live balances", "A calendar showing who's off", "Overlap and balance checks", "Unpaid leave flows straight into payroll"] },
  { Icon: Activity, title: "Attendance & employee monitoring", lead: "Each contract defines the working hours, and the system enforces them.", points: ["Start and end time set per contract", "One-tap clock in and out", "Lateness measured against that employee's start time", "Overtime flagged, approved and paid", "Manager corrections with a record", "Reviews and ratings after each engagement"] },
  { Icon: Headset, title: "Workforce training", lead: "Orientation and workplace readiness before deployment.", points: [...TRAINING] },
];
export default function Services() {
  return (
    <div className="container-x py-14 sm:py-20">
      <div className="max-w-2xl"><h1 className="text-3xl font-bold sm:text-5xl">Services</h1><p className="mt-5 text-lg leading-relaxed text-slate-600">Professional Recruitment • HR Outsourcing • Payroll Management • Workforce Solutions, delivered as one connected service.</p></div>
      <div className="mt-14 grid gap-5 md:grid-cols-2">{SERVICES.map(({ Icon, title, lead, points }) => (
        <article key={title} className="card p-7"><span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-onbrand"><Icon className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-slate-600">{lead}</p>
          <ul className="mt-5 space-y-2.5 text-sm">{points.map((p) => <li key={p} className="flex gap-3 text-slate-700"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-signal/15 text-signal"><Check className="size-3" /></span>{p}</li>)}</ul></article>))}</div>
      <section className="card mt-16 flex flex-wrap items-center justify-between gap-6 p-8 sm:p-10"><div><h2 className="text-2xl font-bold">Which services do you need?</h2><p className="mt-2 text-slate-600">See how they fit together in our packages, or talk to us.</p></div><div className="flex gap-3"><LinkButton href="/packages" variant="secondary" size="lg">View packages</LinkButton><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton></div></section>
    </div>
  );
}
