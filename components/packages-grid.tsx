import Link from "next/link";
import { Check } from "lucide-react";
import type { PublicPackage } from "@/lib/packages";
import { cn } from "@/components/ui";

export function PackagesGrid({ packages }: { packages: PublicPackage[] }) {
  return (
    <div className={cn("grid gap-5", packages.length >= 3 ? "lg:grid-cols-3" : packages.length === 2 ? "md:grid-cols-2" : "max-w-md")}>
      {packages.map((p) => (
        <article key={p.id} className={cn("card relative flex flex-col p-7", p.highlighted && "border-brand-400/60 shadow-[0_0_60px_-20px_rgba(110,128,255,.7)] lg:-my-3 lg:py-10")}>
          {p.highlighted && <span className="absolute right-5 top-5 rounded-full bg-gradient-to-br from-brand-600 to-[#6a4fe6] px-3 py-1 text-xs font-semibold text-onbrand">Most popular</span>}
          <h3 className="text-xl font-bold">{p.name}</h3>
          {p.tagline && <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-500">{p.tagline}</p>}
          <div className="mt-6"><div className="font-display text-2xl font-semibold">{p.priceText}</div>{p.billingNote && <div className="mt-1 text-xs text-slate-500">{p.billingNote}</div>}</div>
          <ul className="mt-7 flex-1 space-y-3 text-sm">{p.features.map((f) => <li key={f} className="flex gap-3 text-slate-700"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-signal/15 text-signal"><Check className="size-3" /></span>{f}</li>)}</ul>
          <Link href={`/contact?package=${encodeURIComponent(p.name)}`} className={cn("mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition", p.highlighted ? "bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand shadow-[0_8px_24px_-8px_rgba(79,92,245,.8)] hover:brightness-110" : "border border-slate-300/60 bg-slate-100/60 text-slate-800 hover:border-brand-400/60")}>Request a quote</Link>
        </article>))}
    </div>
  );
}
