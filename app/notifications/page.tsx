import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { notifications } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Notifications" };
export default async function Notifications() {
  const s = await requireSession();
  const list = await tdb((tx) => tx.select().from(notifications).where(eq(notifications.userId, s.userId)).orderBy(desc(notifications.createdAt)).limit(50));
  return (
    <div className="container-x max-w-3xl py-10">
      <PageHeader title="Notifications" action={list.some((n) => !n.readAt) ? <ActionButton url="/api/notifications" method="POST" variant="secondary" size="md">Mark all read</ActionButton> : undefined} />
      {list.length === 0 ? <Empty title="You're all caught up" /> : <div className="card divide-y divide-slate-100">{list.map((n) => {
        const inner = <div className="flex gap-3 p-4">{!n.readAt ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" /> : <span className="size-2 shrink-0" />}<div className="min-w-0 flex-1"><div className="font-medium">{n.title}</div>{n.body && <div className="text-sm text-slate-500">{n.body}</div>}<div className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</div></div></div>;
        return n.link ? <Link key={n.id} href={n.link} className="block hover:bg-slate-50">{inner}</Link> : <div key={n.id}>{inner}</div>;
      })}</div>}
    </div>
  );
}
