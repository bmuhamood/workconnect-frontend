import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of service" };
export default function Page() {
  return (<div className="container-x max-w-3xl py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight">Terms of service</h1><div className="card space-y-4 p-8 leading-relaxed text-slate-700"><p>By using WorkConnect you agree to provide accurate information and to use the platform lawfully. Contracts are agreements between employer and worker; the platform facilitates but is not a party to them.</p><p>These terms are a starting template. Have them reviewed by your legal adviser before launch.</p></div></div>);
}
