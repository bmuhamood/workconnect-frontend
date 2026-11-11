import { Check } from "lucide-react";
import { cn } from "@/components/ui";

/** Hero visual: a stylised HR Operations console. Static, illustrative sample data (labelled). */
export function OpsPreview() {
  const week: [string, "on" | "late" | "off"][] = [["Mon", "on"], ["Tue", "on"], ["Wed", "late"], ["Thu", "on"], ["Fri", "on"]];
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgb(79_92_245/.4),transparent_65%)] blur-3xl" />
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><span className="size-2.5 rounded-full bg-rose-400/70" /><span className="size-2.5 rounded-full bg-amber-300/70" /><span className="size-2.5 rounded-full bg-signal/70" /><span className="ml-3 text-xs text-slate-400">HR Operations · Overview</span><span className="ml-auto text-[10px] text-slate-400">Sample data</span></div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">{[["Employees", "48"], ["In today", "44 / 48"], ["On leave", "3"]].map(([k, v]) => <div key={k} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"><div className="text-[11px] text-slate-500">{k}</div><div className="mt-1 font-display text-lg font-semibold">{v}</div></div>)}</div>
          <div className="grid grid-cols-[1.2fr_1fr] gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"><div className="mb-2 text-[11px] text-slate-500">Attendance this week</div>
              <div className="flex gap-1.5">{week.map(([d, s]) => <div key={d} className="flex-1 text-center"><div className={cn("mb-1 h-12 rounded-md", s === "on" ? "bg-signal/40" : "bg-amber-400/50")} /><span className="text-[10px] text-slate-500">{d}</span></div>)}</div></div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"><div className="mb-2 text-[11px] text-slate-500">Payroll · November</div>
              <div className="space-y-2 text-xs">{["Calculated", "Approved", "Paid"].map((s, i) => <div key={s} className="flex items-center gap-2"><span className={cn("grid size-4 place-items-center rounded-full", i < 2 ? "bg-signal/25 text-signal" : "bg-slate-200 text-slate-400")}>{i < 2 && <Check className="size-2.5" />}</span><span className={i < 2 ? "text-slate-700" : "text-slate-400"}>{s}</span></div>)}</div></div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs"><span className="text-slate-500">Leave awaiting approval</span><span className="flex gap-2"><span className="rounded-md bg-gradient-to-br from-brand-600 to-brand-700 px-2.5 py-1 font-medium text-onbrand">Approve</span><span className="rounded-md border border-slate-300/60 px-2.5 py-1 text-slate-600">Reject</span></span></div>
        </div>
      </div>
    </div>
  );
}
