import type { Metadata } from "next";
export const metadata: Metadata = { title: "About WorkConnect" };
export default function Page() {
  return (<div className="container-x max-w-3xl py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight">About WorkConnect</h1><div className="card space-y-4 p-8 leading-relaxed text-slate-700"><p>WorkConnect connects families and businesses with verified domestic and skilled workers. Every organisation on the platform has its own private workspace, so data is never shared between clients.</p><p>Contracts, invoices, reviews and messaging are built in, so hiring is safe and simple.</p></div></div>);
}
