"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, FileText, Receipt, LayoutDashboard } from "lucide-react";
import { signOut, type Mode } from "@/lib/auth-client";

const ROLE_LABEL: Record<string, string> = { super_admin: "Super WorkConnect Admin", admin: "HR consultancy owner / admin", employer: "Client", worker: "Employee" };

export function UserMenu({ name, role, avatar, mode }: { name: string; role: string; avatar: React.ReactNode; mode: Mode; demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  async function logout() { await signOut(mode); setOpen(false); router.push("/"); router.refresh(); }
  const item = "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800 hover:bg-slate-100";
  return (
    <div className="relative hidden md:block">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" className="rounded-full ring-2 ring-transparent transition hover:ring-brand-200" aria-label={`Account menu for ${name}`}>{avatar}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-300 bg-white p-2 shadow-xl">
            <div className="px-3 py-2"><div className="truncate text-sm font-semibold">{name}</div><div className="text-xs text-slate-500">{ROLE_LABEL[role] ?? role}</div></div>
            <div className="my-1 h-px bg-slate-200" />
            {role === "super_admin" ? <Link role="menuitem" href="/platform" onClick={() => setOpen(false)} className={item}><LayoutDashboard className="size-4" />Platform console</Link> : <>
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className={item}><User className="size-4" />Profile</Link>
              <Link role="menuitem" href="/contracts" onClick={() => setOpen(false)} className={item}><FileText className="size-4" />Contracts</Link>
              {role === "employer" && <Link role="menuitem" href="/invoices" onClick={() => setOpen(false)} className={item}><Receipt className="size-4" />Invoices</Link>}
            </>}
            <button role="menuitem" onClick={logout} className={item + " w-full font-medium text-rose-700"}><LogOut className="size-4" />Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileNav({ links, signedIn, platform, mode }: { links: { href: string; label: string }[]; signedIn: boolean; platform?: boolean; mode: Mode; demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const all = platform ? links : signedIn ? [...links, { href: "/contracts", label: "Contracts" }, { href: "/profile", label: "Profile" }] : [...links, { href: "/login", label: "Sign in" }, { href: "/register?as=organisation", label: "Register your HR firm" }, { href: "/register", label: "Get started" }];
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-800 hover:bg-slate-100" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      {open && (
        <nav aria-label="Mobile" className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-300 bg-white p-3 shadow-lg">
          {all.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block min-h-11 rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-100">{l.label}</Link>)}
          {signedIn && <button onClick={async () => { await signOut(mode); setOpen(false); router.push("/"); router.refresh(); }} className="block min-h-11 w-full rounded-lg px-3 py-3 text-left text-base font-medium text-rose-700 hover:bg-rose-50">Sign out</button>}
        </nav>)}
    </div>
  );
}
