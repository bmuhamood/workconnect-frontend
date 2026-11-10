import type { Metadata } from "next";
export const metadata: Metadata = { title: "Help centre" };
export default function Page() {
  return (<div className="container-x max-w-3xl py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight">Help centre</h1><div className="card space-y-4 p-8 leading-relaxed text-slate-700"><p><b>How do I hire?</b> Browse workers or post a job, then send a contract offer. Both sides sign digitally.</p><p><b>How do payments work?</b> When a contract becomes active an invoice is generated each month for the salary plus the service fee.</p><p><b>Need more help?</b> Contact your organisation administrator.</p></div></div>);
}
