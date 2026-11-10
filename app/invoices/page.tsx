import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { invoices, contracts } from "@/db/schema";
import { PageHeader, StatusBadge, Empty } from "@/components/ui";
import { PayInvoice } from "@/components/pay-invoice";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Invoices" };
export default async function Invoices() {
  const s = await requireSession(["employer", "admin"]);
  const list = await tdb((tx) => tx.select({ i: invoices, title: contracts.title }).from(invoices).innerJoin(contracts, eq(contracts.id, invoices.contractId)).where(s.role === "admin" ? undefined : eq(invoices.employerId, s.userId)).orderBy(desc(invoices.createdAt)));
  return (
    <div className="container-x py-10">
      <PageHeader title="Invoices" subtitle="Monthly salary and service fee for each active contract." />
      {list.length === 0 ? <Empty title="No invoices yet" hint="An invoice is created when both parties sign a contract." /> : (
        <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="border-b border-slate-100 text-left text-slate-400"><tr><th className="p-4 font-medium">Invoice</th><th className="font-medium">Contract</th><th className="font-medium">Salary</th><th className="font-medium">Fee</th><th className="font-medium">Total</th><th className="font-medium">Status</th><th className="p-4" /></tr></thead>
          <tbody className="divide-y divide-slate-100">{list.map(({ i, title }) => <tr key={i.id}><td className="p-4 font-medium">{i.number}<div className="text-xs font-normal text-slate-400">Due {i.dueDate}</div></td><td>{title}</td><td>{ugx(i.salaryAmount)}</td><td>{ugx(i.feeAmount)}</td><td className="font-semibold">{ugx(i.total)}</td><td><StatusBadge status={i.status} /></td><td className="p-4 text-right">{i.status === "pending" && s.role === "employer" && <PayInvoice id={i.id} />}</td></tr>)}</tbody></table></div>)}
    </div>
  );
}
