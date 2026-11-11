"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

export function HrNav({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="HR sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-2xl border border-slate-200 bg-white/60 p-1.5 backdrop-blur">
        {items.map((i) => {
          const on = i.href === "/hr" ? path === "/hr" : path.startsWith(i.href);
          return <li key={i.href}><Link href={i.href} aria-current={on ? "page" : undefined} className={cn("block rounded-xl px-4 py-2 text-sm font-medium transition", on ? "bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand shadow-[0_6px_20px_-8px_rgba(79,92,245,.9)]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}>{i.label}</Link></li>;
        })}
      </ul>
    </nav>
  );
}
