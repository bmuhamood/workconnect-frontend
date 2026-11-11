import Link from "next/link";
import { Bell, Building2 } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { getSession, getPlatformAdmin } from "@/lib/session";
import { AUTH_MODE, DEMO_LOGIN } from "@/lib/auth-mode";
import { currentTenant } from "@/lib/tenant";
import { rootDb as db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";
import { LinkButton, Avatar } from "@/components/ui";
import { UserMenu, MobileNav } from "@/components/navbar-client";
import { DisplayMenu } from "@/components/display-menu";

export async function Navbar() {
  let s: Awaited<ReturnType<typeof getSession>> = null;
  let platform: Awaited<ReturnType<typeof getPlatformAdmin>> = null;
  let tenant: Awaited<ReturnType<typeof currentTenant>> = null;
  let unread = 0;
  try {
    s = await getSession();
    platform = s ? null : await getPlatformAdmin();
    tenant = await currentTenant();
    if (s) {
      const [r] = await db.select({ n: count() }).from(notifications).where(and(eq(notifications.userId, s.userId), isNull(notifications.readAt)));
      unread = r?.n ?? 0;
    }
  } catch (e) {
    console.error("[navbar] could not load session/tenant:", (e as Error).message);
  }
  const links = platform
    ? [{ href: "/platform", label: "Platform console" }, { href: "/platform/new", label: "Add HR consultancy" }]
    : s
      ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/hr", label: s.role === "worker" ? "My HR" : "HR Operations" }, { href: "/jobs", label: "Jobs" }, ...(s.role !== "worker" ? [{ href: "/workers", label: "Talent" }] : []), { href: "/messages", label: "Messages" }, ...(s.role === "admin" ? [{ href: "/admin", label: "Admin" }] : [])]
      : [{ href: "/services", label: "Services" }, { href: "/packages", label: "Packages" }, { href: "/jobs", label: "Jobs" }, { href: "/workers", label: "Talent" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }];
  const who = s ?? platform;
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md print:hidden">
      <div className="container-x flex min-h-16 items-center justify-between gap-3 py-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight" aria-label="WorkConnect home">
          <LogoMark />
          <span>WorkConnect{tenant && !platform && <span className="ml-2 hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 lg:inline">{tenant.name}</span>}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[0.95rem] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">{l.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <DisplayMenu />
          {s && (
            <Link href="/notifications" className="relative grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-700 hover:bg-slate-100" aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}>
              <Bell className="size-5" aria-hidden="true" />
              {unread > 0 && <span aria-hidden="true" className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-onbrand">{unread > 9 ? "9+" : unread}</span>}
            </Link>)}
          {who ? <UserMenu name={who.name} role={platform ? "super_admin" : s!.role} avatar={<Avatar name={who.name} size={34} />} mode={AUTH_MODE} demo={DEMO_LOGIN} />
            : (
              <div className="hidden items-center gap-2 md:flex">
                <LinkButton href="/login" variant="ghost">Sign in</LinkButton>
                <LinkButton href="/register?as=organisation" variant="secondary"><Building2 className="size-4" aria-hidden="true" />Register your HR firm</LinkButton>
                <LinkButton href="/register">Get started</LinkButton>
              </div>)}
          <MobileNav links={links} signedIn={!!who} platform={!!platform} mode={AUTH_MODE} demo={DEMO_LOGIN} />
        </div>
      </div>
    </header>
  );
}
