import Link from "next/link";
import { Bell, Briefcase } from "lucide-react";
import { getSession } from "@/lib/session";
import { AUTH_MODE } from "@/lib/auth-mode";
import { currentTenant } from "@/lib/tenant";
import { rootDb as db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";
import { LinkButton, Avatar } from "@/components/ui";
import { UserMenu, MobileNav } from "@/components/navbar-client";

export async function Navbar() {
  const s = await getSession();
  const tenant = await currentTenant();
  let unread = 0;
  if (s) {
    const [r] = await db.select({ n: count() }).from(notifications).where(and(eq(notifications.userId, s.userId), isNull(notifications.readAt)));
    unread = r?.n ?? 0;
  }
  const links = [
    { href: "/jobs", label: "Find jobs" }, { href: "/workers", label: "Find workers" },
    ...(s ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/messages", label: "Messages" }, ...(s.role === "admin" ? [{ href: "/admin", label: "Admin" }] : [])] : []),
    { href: "/about", label: "About" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white"><Briefcase className="size-4" /></span>
          <span>WorkConnect{tenant && <span className="ml-2 hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 sm:inline">{tenant.name}</span>}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">{l.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          {s ? (
            <>
              <Link href="/notifications" className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <UserMenu name={s.name} role={s.role} avatar={<Avatar name={s.name} size={32} />} mode={AUTH_MODE} />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <LinkButton href="/login" variant="ghost">Sign in</LinkButton>
              <LinkButton href="/register">Get started</LinkButton>
            </div>
          )}
          <MobileNav links={links} signedIn={!!s} mode={AUTH_MODE} />
        </div>
      </div>
    </header>
  );
}
