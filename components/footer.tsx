import Link from "next/link";
export function Footer() {
  const col = (t: string, items: [string, string][]) => (
    <div><div className="mb-3 text-sm font-semibold">{t}</div><ul className="space-y-2 text-sm text-slate-500">{items.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-accent-strong">{l}</Link></li>)}</ul></div>
  );
  return (
    <footer className="print:hidden mt-24 border-t border-slate-200 bg-white">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div><div className="text-lg font-bold">Work Connect UG Ltd</div><p className="mt-2 text-sm text-slate-500">Connecting Businesses with the Right Talent. Professional recruitment, HR outsourcing, payroll management and workforce solutions in Uganda.</p></div>
        {col("Services", [["All services", "/services"], ["Packages", "/packages"], ["Jobs", "/jobs"], ["Talent", "/workers"]])}
        {col("Company", [["About", "/about"], ["Contact", "/contact"], ["Help centre", "/help"], ["Register your HR firm", "/register?as=organisation"]])}
        {col("Legal", [["Terms", "/terms"], ["Privacy", "/privacy"]])}
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} Work Connect UG Ltd. All rights reserved.</div>
    </footer>
  );
}
