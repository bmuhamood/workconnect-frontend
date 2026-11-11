import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { HrNav } from "@/components/hr-nav";

export const metadata: Metadata = { title: { default: "HR Operations", template: "%s · HR Operations" } };
export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSession();
  const items = [
    { href: "/hr", label: "Overview" },
    ...(s.role !== "worker" ? [{ href: "/hr/employees", label: "Employees" }] : []),
    { href: "/hr/leave", label: "Leave" }, { href: "/hr/attendance", label: "Attendance" },
    ...(s.role !== "employer" ? [{ href: "/hr/payroll", label: s.role === "worker" ? "Payslips" : "Payroll" }] : []),
    { href: "/hr/support", label: "HR support" },
    ...(s.role === "admin" ? [{ href: "/hr/settings", label: "Settings" }] : []),
  ];
  return (
    <div className="container-x py-8">
      <div className="mb-8 print:hidden"><div className="mb-1 text-sm text-slate-500">{s.tenantName}</div><h1 className="text-2xl font-bold sm:text-3xl">HR Operations</h1></div>
      <div className="mb-8 print:hidden"><HrNav items={items} /></div>
      {children}
    </div>
  );
}
