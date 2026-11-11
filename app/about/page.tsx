import type { Metadata } from "next";
export const metadata: Metadata = { title: "About WorkConnect" };
export default function Page() {
  return (<div className="container-x max-w-3xl py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight">About WorkConnect</h1><div className="card space-y-4 p-8 leading-relaxed text-slate-700"><p>WorkConnect is an HR consulting and workforce management partner. We recruit and place qualified people, manage their contracts and records, run payroll, track leave and attendance, and support your staff day to day.</p><p>Every client has a private workspace, so your data is never shared with anyone else. Payroll, leave, attendance and the HR helpdesk run on one platform you and your employees can use every day.</p></div></div>);
}
