import Link from "next/link";
export function Footer() {
  const col = (t: string, items: [string, string][]) => (
    <div><div className="mb-3 text-sm font-semibold">{t}</div><ul className="space-y-2 text-sm text-slate-500">{items.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-accent-strong">{l}</Link></li>)}</ul></div>
  );
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div><div className="text-lg font-bold">WorkConnect</div><p className="mt-2 text-sm text-slate-500">Verified domestic and skilled workers, matched with trusted employers across Uganda.</p></div>
        {col("Find", [["Services", "/#services"], ["Jobs", "/jobs"], ["Workers", "/workers"]])}
        {col("Company", [["About", "/about"], ["Contact", "/contact"], ["Help centre", "/help"]])}
        {col("Legal", [["Terms", "/terms"], ["Privacy", "/privacy"]])}
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} WorkConnect. All rights reserved.</div>
    </footer>
  );
}
