import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformLeads } from "@/db/schema";
import { requireStaff } from "@/lib/session";
import { Empty, StatusBadge } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiries" };
export default async function Leads() {
  await requireStaff();
  const list = await rootDb.select().from(platformLeads).orderBy(desc(platformLeads.createdAt)).limit(100);
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold">Enquiries ({list.length})</h2><p className="mb-4 text-sm text-slate-600">From the contact form on the public website. Replying by email goes straight to the sender.</p>
      {list.length === 0 ? <Empty title="No enquiries yet" /> : <div className="card divide-y divide-slate-200">{list.map((l) => (
        <div key={l.id} className="p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-semibold">{l.name}{l.company ? <span className="font-normal text-slate-500"> · {l.company}</span> : null} <a className="font-normal text-accent hover:underline" href={`mailto:${l.email}?subject=${encodeURIComponent("Re: " + l.topic)}`}>{l.email}</a>{l.phone ? <span className="font-normal text-slate-500"> · {l.phone}</span> : null}</div><div className="flex items-center gap-2"><span className="text-xs text-slate-500">{l.topic} · {timeAgo(l.createdAt)}</span><StatusBadge status={l.status === "new" ? "pending" : l.status === "contacted" ? "in_progress" : "resolved"} /></div></div>
          <p className="mt-2 whitespace-pre-line text-slate-700">{l.message}</p>
          <div className="mt-3 flex gap-2">{l.status !== "contacted" && <ActionButton url={`/api/platform/leads/${l.id}`} data={{ status: "contacted" }} variant="secondary">Mark contacted</ActionButton>}{l.status !== "closed" && <ActionButton url={`/api/platform/leads/${l.id}`} data={{ status: "closed" }} variant="ghost">Close</ActionButton>}{l.status !== "new" && <ActionButton url={`/api/platform/leads/${l.id}`} data={{ status: "new" }} variant="ghost">Reopen</ActionButton>}</div>
        </div>))}</div>}
    </div>
  );
}
