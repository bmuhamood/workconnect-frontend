import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy policy" };
export default function Page() {
  return (<div className="container-x max-w-3xl py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight">Privacy policy</h1><div className="card space-y-4 p-8 leading-relaxed text-slate-700"><p>We collect the information you provide (name, contact details, profile and job data) to operate the service. Each organisation's data is isolated from every other organisation. We email you about your account and, if you opt in, marketing — you can unsubscribe at any time.</p><p>This policy is a starting template. Have it reviewed before launch.</p></div></div>);
}
