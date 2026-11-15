import type { Metadata } from "next";
import { requireStaff } from "@/lib/session";
import { HrNav } from "@/components/hr-nav";

export const metadata: Metadata = { title: { default: "Platform console", template: "%s · Platform" }, robots: { index: false } };
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const items = [{ href: "/platform", label: "Clients" }, { href: "/platform/leads", label: "Enquiries" }, ...(staff.superAdmin ? [{ href: "/platform/packages", label: "Packages" }, { href: "/platform/team", label: "Consultants" }, { href: "/platform/accounts", label: "Accounts" }, { href: "/platform/audit", label: "Audit log" }] : [])];
  return (
    <div className="container-x py-8">
      <div className="mb-6"><div className="text-sm text-slate-500">{staff.superAdmin ? "Super WorkConnect Admin" : "WorkConnect consultant"} · {staff.name}</div><h1 className="text-2xl font-bold sm:text-3xl">Platform console</h1></div>
      <div className="mb-8"><HrNav items={items} /></div>
      {children}
    </div>
  );
}
