"use client";
import { useRef, useState } from "react";
import { Users, FileSignature, Wallet, CalendarDays, Activity, Headset, Check } from "lucide-react";
import { cn } from "@/components/ui";

type Svc = { id: string; title: string; blurb: string; icon: typeof Users; Preview: () => React.JSX.Element };

const Chip = ({ children, tone = "base" }: { children: React.ReactNode; tone?: "base" | "signal" | "brand" | "rose" | "amber" }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
    tone === "signal" ? "border-signal/50 bg-signal/10 text-signal" : tone === "brand" ? "border-brand-400/50 bg-brand-50 text-accent" : tone === "rose" ? "border-rose-600/40 bg-rose-50 text-rose-700" : tone === "amber" ? "border-amber-600/40 bg-amber-50 text-amber-700" : "border-slate-300/50 bg-slate-100/60 text-slate-700")}>{children}</span>
);
const Bar = ({ label, value, tone = "bg-brand-500" }: { label: string; value: number; tone?: string }) => (
  <div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>{label}</span><span>{value}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} /></div></div>
);

function Recruitment() {
  const cols: [string, string[]][] = [["Sourced", ["Driver", "Cleaner", "Accountant"]], ["Screened", ["Technician", "Cleaner"]], ["Interviewed", ["Supervisor", "IT specialist"]], ["Placed", ["Warehouse staff"]]];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cols.map(([h, items], i) => (
        <div key={h} className={cn("rounded-xl border p-3", i === 3 ? "border-signal/40 bg-signal/5" : "border-slate-200 bg-slate-50/40")}>
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-700">{h}<span className="text-slate-400">{items.length}</span></div>
          <div className="space-y-2">{items.map((r) => <div key={r + h} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700">{r}</div>)}</div>
        </div>
      ))}
    </div>
  );
}
function Management() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="text-sm font-semibold">Employment contract</div>
        <div className="mt-3 space-y-2">{[88, 100, 72, 94, 60].map((w, i) => <div key={i} className="h-1.5 rounded-full bg-slate-200" style={{ width: `${w}%` }} />)}</div>
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Chip tone="signal"><Check className="size-3" />Employer signed</Chip><Chip tone="signal"><Check className="size-3" />Employee signed</Chip></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="text-sm font-semibold">Employee record</div>
        <ul className="mt-3 space-y-2.5 text-sm">{["National ID", "Signed contract", "Reference check", "Payment details"].map((d) => <li key={d} className="flex items-center gap-2 text-slate-700"><span className="grid size-5 place-items-center rounded-full bg-signal/15 text-signal"><Check className="size-3" /></span>{d}</li>)}</ul>
      </div>
    </div>
  );
}
function Payroll() {
  const steps = ["Calculated", "Approved", "Paid"];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">{steps.map((s, i) => <div key={s} className="flex flex-1 items-center gap-2"><span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold", i < 3 ? "bg-signal/20 text-signal" : "bg-slate-100 text-slate-400")}>{i < 2 ? <Check className="size-3" /> : <Check className="size-3" />}</span><span className="text-xs text-slate-600">{s}</span>{i < 2 && <span className="h-px flex-1 bg-signal/40" />}</div>)}</div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-sm">
        {[["Monthly salary", "UGX 450,000"], ["Service fee (10%)", "UGX 45,000"]].map(([k, v]) => <div key={k} className="flex justify-between py-2 text-slate-600"><span>{k}</span><span>{v}</span></div>)}
        <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 font-semibold"><span>Invoice total</span><span>UGX 495,000</span></div>
      </div>
      <div className="flex flex-wrap gap-2"><Chip tone="signal"><Check className="size-3" />Paid</Chip><Chip>MTN MoMo</Chip><Chip>Airtel Money</Chip><Chip>Card</Chip><Chip>Bank</Chip></div>
    </div>
  );
}
function Leave() {
  const mark: Record<number, "brand" | "rose" | "amber"> = { 3: "brand", 4: "brand", 5: "brand", 11: "rose", 17: "amber", 22: "brand", 23: "brand" };
  const tone = { brand: "bg-brand-500/60 text-onbrand", rose: "bg-rose-500/60 text-onbrand", amber: "bg-amber-400/20 text-amber-700" };
  return (
    <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="mb-3 grid grid-cols-7 gap-1.5 text-center text-xs text-slate-400">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1.5">{Array.from({ length: 28 }, (_, i) => <div key={i} className={cn("grid aspect-square place-items-center rounded-md text-xs text-slate-500", mark[i + 1] ? tone[mark[i + 1]] : "bg-slate-100/70")}>{i + 1}</div>)}</div>
      </div>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <Bar label="Annual leave left" value={67} /><Bar label="Sick leave left" value={80} tone="bg-rose-400" />
        <div className="flex flex-wrap gap-2 pt-1"><Chip tone="brand">Annual</Chip><Chip tone="rose">Sick</Chip><Chip tone="amber">Public holiday</Chip></div>
      </div>
    </div>
  );
}
function Monitoring() {
  const week: ["Mon" | "Tue" | "Wed" | "Thu" | "Fri", "on" | "late" | "off"][] = [["Mon", "on"], ["Tue", "on"], ["Wed", "late"], ["Thu", "on"], ["Fri", "on"]];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <div className="mb-3 text-sm font-semibold">This week</div>
        <div className="flex gap-2">{week.map(([d, s]) => <div key={d} className="flex-1 text-center"><div className={cn("mx-auto mb-1.5 h-10 rounded-lg", s === "on" ? "bg-signal/40" : s === "late" ? "bg-amber-400/50" : "bg-slate-200")} /><span className="text-xs text-slate-500">{d}</span></div>)}</div>
        <div className="mt-3 flex gap-2"><Chip tone="signal">On time</Chip><Chip tone="amber">Late</Chip></div>
      </div>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
        <Bar label="Attendance" value={96} tone="bg-signal" /><Bar label="Performance" value={88} /><Bar label="Productivity" value={91} tone="bg-[#8b6cff]" />
        <div className="text-xs text-slate-500">Conduct notes: none this month</div>
      </div>
    </div>
  );
}
function Support() {
  const bub = (me: boolean, t: string) => <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm", me ? "ml-auto bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand" : "bg-slate-100 text-slate-700")}>{t}</div>;
  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      {bub(false, "Can I get a copy of my employment contract?")}
      {bub(true, "Yes. It's in your documents. I've also sent it to your email.")}
      {bub(false, "Thank you. And how do I request leave?")}
      {bub(true, "Pick your dates in Leave. Your employer is notified straight away.")}
    </div>
  );
}

const SERVICES: Svc[] = [
  { id: "recruitment", title: "Manpower sourcing & recruitment", blurb: "Sourcing, screening, interviewing and placing qualified candidates.", icon: Users, Preview: Recruitment },
  { id: "management", title: "Employee management", blurb: "Onboarding, employment contracts, employee records and HR administration.", icon: FileSignature, Preview: Management },
  { id: "payroll", title: "Payroll & payments", blurb: "Salary processing, payroll administration and employee payments.", icon: Wallet, Preview: Payroll },
  { id: "leave", title: "Leave management", blurb: "Annual leave, sick leave and other leave entitlements, kept in order.", icon: CalendarDays, Preview: Leave },
  { id: "monitoring", title: "Employee monitoring", blurb: "Attendance, performance, productivity and conduct, tracked in one view.", icon: Activity, Preview: Monitoring },
  { id: "support", title: "HR administration & support", blurb: "Ongoing HR support and management of employee-related processes.", icon: Headset, Preview: Support },
];

export function ServicesExplorer() {
  const [i, setI] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (n: number) => { const k = (n + SERVICES.length) % SERVICES.length; setI(k); refs.current[k]?.focus(); };
  const { Preview } = SERVICES[i];
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div role="tablist" aria-orientation="vertical" aria-label="Our services" className="flex flex-col gap-1.5">
        {SERVICES.map((s, k) => {
          const Icon = s.icon; const on = k === i;
          return (
            <button key={s.id} ref={(el) => { refs.current[k] = el; }} role="tab" id={`svc-tab-${s.id}`} aria-selected={on} aria-controls="svc-panel" tabIndex={on ? 0 : -1}
              onClick={() => setI(k)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); move(k + 1); } if (e.key === "ArrowUp") { e.preventDefault(); move(k - 1); } }}
              className={cn("group flex items-start gap-3 rounded-xl border p-3.5 text-left transition", on ? "border-brand-400/60 bg-brand-50 shadow-[0_0_30px_-12px_rgba(110,128,255,.7)]" : "border-transparent hover:border-slate-300/50 hover:bg-slate-100/40")}>
              <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg", on ? "bg-gradient-to-br from-brand-600 to-[#6a4fe6] text-onbrand" : "bg-slate-100 text-slate-500 group-hover:text-slate-700")}><Icon className="size-[18px]" /></span>
              <span><span className={cn("block font-semibold", on ? "text-slate-900" : "text-slate-700")}>{s.title}</span><span className="mt-0.5 block text-sm leading-snug text-slate-500">{s.blurb}</span></span>
            </button>
          );
        })}
      </div>
      <div id="svc-panel" role="tabpanel" aria-labelledby={`svc-tab-${SERVICES[i].id}`} className="card relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-500/20 blur-3xl" />
        <div key={SERVICES[i].id} className="relative animate-rise">
          <div className="mb-5 flex items-baseline justify-between gap-3"><h3 className="text-lg font-semibold">{SERVICES[i].title}</h3><span className="text-xs text-slate-400">Illustrative preview</span></div>
          <Preview />
        </div>
      </div>
    </div>
  );
}
