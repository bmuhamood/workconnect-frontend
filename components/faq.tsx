import { Plus } from "lucide-react";
export const FAQS: [string, string][] = [
  ["How is pricing decided?", "Packages are priced by headcount and scope. After a short consultation we send a clear quote, with no hidden fees."],
  ["Can we start with recruitment and add services later?", "Yes. Many clients begin with recruitment and move to workforce management once their team grows. Your records carry over, so there is nothing to re-enter."],
  ["Is our data kept separate from other clients?", "Yes. Every organisation has its own private workspace. Staff, contracts, payroll and messages are isolated at the database level, so no other client can see them."],
  ["How does payroll work?", "Each month a payroll run is generated for every employee on a live contract. PAYE, NSSF and any unpaid leave are calculated, you review the run, and payslips go out when it's approved."],
  ["Who is responsible for statutory rates?", "Rates are configurable and must be confirmed by an administrator before payroll can be approved. Rates change, so we ask you to check them against URA and NSSF guidance each time."],
  ["Do you handle leave, attendance and day-to-day HR questions?", "Yes. Employees request leave and clock in online, managers approve and review, and staff can raise HR requests that are answered in one place."],
];
export function Faq() {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white/40">
      {FAQS.map(([q, a]) => (
        <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<Plus className="size-5 shrink-0 text-accent transition group-open:rotate-45" /></summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">{a}</p>
        </details>))}
    </div>
  );
}
