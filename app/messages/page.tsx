import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq, or, sql } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { conversations, users, messages } from "@/db/schema";
import { PageHeader, Avatar, Empty, cn } from "@/components/ui";
import { Chat } from "@/components/chat";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Messages" };
export default async function Messages({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const s = await requireSession();
  const { c } = await searchParams;
  const list = await tdb(async (tx) => {
    const rows = await tx.select().from(conversations).where(or(eq(conversations.userA, s.userId), eq(conversations.userB, s.userId))).orderBy(desc(conversations.lastMessageAt));
    return Promise.all(rows.map(async (r) => {
      const other = r.userA === s.userId ? r.userB : r.userA;
      const [u] = await tx.select({ first: users.firstName, last: users.lastName }).from(users).where(eq(users.id, other));
      const [unread] = await tx.select({ n: sql<number>`count(*)::int` }).from(messages).where(sql`${messages.conversationId} = ${r.id} and ${messages.senderId} <> ${s.userId} and ${messages.readAt} is null`);
      return { ...r, name: `${u?.first ?? "Unknown"} ${u?.last ?? ""}`.trim(), unread: unread.n };
    }));
  });
  const active = list.find((x) => x.id === c) ?? list[0];
  return (
    <div className="container-x py-10">
      <PageHeader title="Messages" />
      {list.length === 0 ? <Empty title="No conversations yet" hint="Open a worker or employer profile and tap Message to start one." /> : (
        <div className="card grid overflow-hidden md:grid-cols-[300px_1fr]">
          <div className="max-h-[70vh] overflow-y-auto border-b border-slate-100 md:border-b-0 md:border-r">{list.map((x) => (
            <Link key={x.id} href={`/messages?c=${x.id}`} className={cn("flex items-center gap-3 p-4 hover:bg-slate-50", active?.id === x.id && "bg-brand-50")}><Avatar name={x.name} /><div className="min-w-0 flex-1"><div className="truncate font-medium">{x.name}</div><div className="text-xs text-slate-400">{timeAgo(x.lastMessageAt)}</div></div>{x.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-onbrand">{x.unread}</span>}</Link>))}</div>
          <div>{active && <><div className="flex items-center gap-3 border-b border-slate-100 p-4"><Avatar name={active.name} size={32} /><span className="font-semibold">{active.name}</span></div><Chat key={active.id} conversationId={active.id} me={s.userId} /></>}</div>
        </div>)}
    </div>
  );
}
