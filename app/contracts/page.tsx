import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, or } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { contracts, users } from "@/db/schema";
import { PageHeader, StatusBadge, Empty } from "@/components/ui";
import { ugx } from "@/lib/format";

export const metadata: Metadata = { title: "Contracts" };
export default async function Contracts() {
  const s = await requireSession();
  const list = await tdb(async (tx) => {
    const mine = s.role === "admin" ? undefined : or(eq(contracts.employerId, s.userId), eq(contracts.workerId, s.userId));
    return tx.select({ c: contracts, first: users.firstName, last: users.lastName }).from(contracts)
      .innerJoin(users, eq(users.id, s.role === "worker" ? contracts.employerId : contracts.workerId)).where(mine).orderBy(desc(contracts.createdAt));
  });
  return (
    <div className="container-x py-10">
      <PageHeader title="Contracts" subtitle="Offers, signatures and active engagements." />
      {list.length === 0 ? <Empty title="No contracts yet" hint={s.role === "employer" ? "Hire a worker to send your first contract." : "Contracts you receive will appear here."} /> :
        <div className="card divide-y divide-slate-100">{list.map(({ c, first, last }) => (
          <Link key={c.id} href={`/contracts/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-slate-50">
            <div><div className="font-medium">{c.title}</div><div className="text-sm text-slate-500">{s.role === "worker" ? "Employer" : "Worker"}: {first} {last} · {ugx(c.salary)}/mo</div></div><StatusBadge status={c.status} />
          </Link>))}</div>}
    </div>
  );
}
