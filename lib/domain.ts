import "server-only";
import { after } from "next/server";
import { and, eq } from "drizzle-orm";
import type { Tx } from "@/lib/db";
import { notifications, conversations, users, tenants, memberships } from "@/db/schema";
import { queueEmail, templates, brandOf, appUrl, flushOutbox } from "@/lib/email";

export const serviceFee = (salary: number, bps: number) => Math.round((salary * bps) / 10000);

type NotifyOpts = { title: string; body?: string; link?: string; email?: boolean; followUp?: boolean };
/** In-app notification, plus a branded transactional email when `email` is true. */
export async function notify(tx: Tx, userId: string, o: NotifyOpts) {
  await tx.insert(notifications).values({ userId, title: o.title, body: o.body ?? "", link: o.link });
  if (!o.email) return;
  const [u] = await tx.select({ email: users.email, first: users.firstName }).from(users).where(eq(users.id, userId)).limit(1);
  const [t] = await tx.select().from(tenants).limit(1); // RLS: only the current tenant is visible
  if (!u || !t) return;
  const cta = o.link ? { label: "Open in WorkConnect", url: appUrl() + o.link } : undefined;
  await queueEmail(tx, { email: u.email, name: u.first }, templates.notice(brandOf(t), { title: o.title, body: `Hi ${u.first},\n\n${o.body ?? o.title}`, cta, followUp: o.followUp }), o.followUp ? "followup" : "notice");
  after(() => flushOutbox(10));
}

/** In-app notification (and optional email) to every admin of the current tenant. */
export async function notifyAdmins(tx: Tx, o: NotifyOpts) {
  const admins = await tx.select({ id: memberships.userId }).from(memberships).where(eq(memberships.role, "admin"));
  for (const a of admins) await notify(tx, a.id, o);
}

export async function getOrCreateConversation(tx: Tx, a: string, b: string) {
  const [x, y] = a < b ? [a, b] : [b, a];
  const q = () => tx.select().from(conversations).where(and(eq(conversations.userA, x), eq(conversations.userB, y))).limit(1);
  const found = await q();
  if (found[0]) return found[0];
  await tx.insert(conversations).values({ userA: x, userB: y }).onConflictDoNothing();
  return (await q())[0];
}
export const isParticipant = (c: { userA: string; userB: string }, uid: string) => c.userA === uid || c.userB === uid;
