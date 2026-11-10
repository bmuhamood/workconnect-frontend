"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User, FileText, Receipt } from "lucide-react";
import { signOut, type Mode } from "@/lib/auth-client";

export function UserMenu({ name, role, avatar, mode }: { name: string; role: string; avatar: React.ReactNode; mode: Mode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  async function logout() { await signOut(mode); setOpen(false); router.push("/"); router.refresh(); }
  const item = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100";
  return (
    <div className="relative hidden md:block">
      <button onClick={() => setOpen(!open)} className="rounded-full ring-2 ring-transparent transition hover:ring-brand-200" aria-label="Account menu">{avatar}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="px-3 py-2"><div className="truncate text-sm font-semibold">{name}</div><div className="text-xs capitalize text-slate-500">{role}</div></div>
            <div className="my-1 h-px bg-slate-100" />
            <Link href="/profile" onClick={() => setOpen(false)} className={item}><User className="size-4" />Profile</Link>
            <Link href="/contracts" onClick={() => setOpen(false)} className={item}><FileText className="size-4" />Contracts</Link>
            {role === "employer" && <Link href="/invoices" onClick={() => setOpen(false)} className={item}><Receipt className="size-4" />Invoices</Link>}
            <button onClick={logout} className={item + " w-full text-rose-600"}><LogOut className="size-4" />Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileNav({ links, signedIn, mode }: { links: { href: string; label: string }[]; signedIn: boolean; mode: Mode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const all = signedIn ? [...links, { href: "/contracts", label: "Contracts" }, { href: "/profile", label: "Profile" }] : [...links, { href: "/login", label: "Sign in" }, { href: "/register", label: "Get started" }];
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="rounded-xl p-2 text-slate-700 hover:bg-slate-100" aria-label="Menu">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-slate-200 bg-white p-3 shadow-lg">
          {all.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">{l.label}</Link>)}
          {signedIn && <button onClick={async () => { await signOut(mode); setOpen(false); router.push("/"); router.refresh(); }} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">Sign out</button>}
        </div>
      )}
    </div>
  );
}
