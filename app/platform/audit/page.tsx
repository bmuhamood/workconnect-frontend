import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { auditLog } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/session";
import { Empty } from "@/components/ui";

export const metadata: Metadata = { title: "Audit log" };
export default async function Audit() {
  await requirePlatformAdmin();
  const list = await rootDb.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
  return (
    <div><h2 className="mb-1 text-lg font-bold">Audit log</h2><p className="mb-4 text-sm text-slate-600">Platform actions and every time WorkConnect staff open a client workspace. The log is append-only.</p>
      {list.length === 0 ? <Empty title="Nothing recorded yet" /> : <div className="card overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="border-b border-slate-200 text-left text-slate-500"><tr><th scope="col" className="p-4 font-medium">When</th><th scope="col" className="font-medium">Who</th><th scope="col" className="font-medium">Action</th><th scope="col" className="font-medium">Client</th><th scope="col" className="font-medium">Detail</th></tr></thead>
        <tbody className="divide-y divide-slate-200">{list.map((l) => <tr key={l.id}><td className="p-4 whitespace-nowrap text-slate-600">{l.createdAt.toISOString().replace("T", " ").slice(0, 16)}</td><td>{l.actorName}</td><td>{l.action.replace(/_/g, " ")}</td><td>{l.tenantName ?? "—"}</td><td className="text-slate-600">{l.detail ?? ""}</td></tr>)}</tbody></table></div>}
    </div>
  );
}
