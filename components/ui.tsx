import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Star } from "lucide-react";
import { initials } from "@/lib/format";

export const cn = (...a: Parameters<typeof clsx>) => twMerge(clsx(a));

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:scale-[.98]",
  secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};
export const btn = (v: keyof typeof variants = "primary", size: "sm" | "md" | "lg" = "md") =>
  cn("inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:opacity-60 disabled:pointer-events-none",
    size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2.5 text-sm", variants[v]);

export function LinkButton({ href, variant, size, className, children }: { href: string; variant?: keyof typeof variants; size?: "sm" | "md" | "lg"; className?: string; children: React.ReactNode }) {
  return <Link href={href} className={cn(btn(variant, size), className)}>{children}</Link>;
}

const tones: Record<string, string> = {
  gray: "bg-slate-100 text-slate-700", green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20", red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  blue: "bg-brand-50 text-brand-700 ring-brand-600/20",
};
export const Badge = ({ tone = "gray", children, className }: { tone?: keyof typeof tones; children: React.ReactNode; className?: string }) =>
  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-transparent", tones[tone], className)}>{children}</span>;

const statusTone: Record<string, keyof typeof tones> = {
  open: "green", active: "green", paid: "green", accepted: "green", completed: "blue", shortlisted: "blue",
  pending: "amber", pending_signature: "amber", draft: "gray", filled: "blue", closed: "gray",
  rejected: "red", terminated: "red", overdue: "red", withdrawn: "gray",
};
export const StatusBadge = ({ status }: { status: string }) =>
  <Badge tone={statusTone[status] ?? "gray"}>{status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}</Badge>;

export const Avatar = ({ name, size = 40 }: { name: string; size?: number }) => {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 50) % 360} 70% 45%))` }}>{initials(name)}</span>;
};

export const Stars = ({ value, count }: { value: number; count?: number }) => (
  <span className="inline-flex items-center gap-1 text-sm text-slate-600">
    <Star className="size-4 fill-amber-400 text-amber-400" />
    <span className="font-medium text-slate-800">{value > 0 ? value.toFixed(1) : "New"}</span>
    {count !== undefined && value > 0 && <span className="text-slate-400">({count})</span>}
  </span>
);

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}</div>
    {action}
  </div>
);

export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) => (
  <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
    <div className="text-lg font-semibold">{title}</div>
    {hint && <p className="max-w-sm text-sm text-slate-500">{hint}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export const Stat = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between text-sm text-slate-500">{label}{icon}</div>
    <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
  </div>
);
