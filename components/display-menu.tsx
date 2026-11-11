"use client";
import { useEffect, useRef, useState } from "react";
import { Eye, X } from "lucide-react";

type Prefs = { theme: "light" | "dark" | "contrast"; text: "md" | "lg" | "xl"; font: "default" | "readable"; motion: "full" | "reduce" };
const KEY = "wc-display";

function read(): Prefs {
  const d = document.documentElement.dataset;
  return { theme: (d.theme as Prefs["theme"]) || "light", text: (d.text as Prefs["text"]) || "md", font: d.font === "readable" ? "readable" : "default", motion: d.motion === "reduce" ? "reduce" : "full" };
}
function apply(p: Prefs) {
  const d = document.documentElement.dataset;
  d.theme = p.theme;
  if (p.text === "md") delete d.text; else d.text = p.text;
  if (p.font === "readable") d.font = "readable"; else delete d.font;
  if (p.motion === "reduce") d.motion = "reduce"; else delete d.motion;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode: preference just won't persist */ }
}

/** Accessibility controls available on every page: theme, text size, readable font, reduced motion. */
export function DisplayMenu() {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Prefs>({ theme: "light", text: "md", font: "default", motion: "full" });
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { setP(read()); }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => { const n = { ...p, [k]: v }; setP(n); apply(n); };
  const reset = () => { const n: Prefs = { theme: "light", text: "md", font: "default", motion: "full" }; setP(n); apply(n); };

  const Group = <K extends "theme" | "text">({ legend, k, options }: { legend: string; k: K; options: [Prefs[K], string][] }) => (
    <fieldset className="mt-4">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map(([v, label]) => (
          <label key={v} className={`cursor-pointer rounded-lg border px-2 py-2.5 text-center text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-signal)] ${p[k] === v ? "border-brand-500 bg-brand-600 text-onbrand" : "border-slate-300 hover:border-brand-400"}`}>
            <input type="radio" name={k} value={v} checked={p[k] === v} onChange={() => set(k, v)} className="sr-only" />{label}
          </label>
        ))}
      </div>
    </fieldset>
  );
  const Toggle = ({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) => (
    <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 accent-brand-600" />
      <span><span className="block font-semibold">{label}</span><span className="text-slate-500">{hint}</span></span>
    </label>
  );

  return (
    <div className="relative">
      <button ref={btn} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="display-panel" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
        <Eye className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Display</span><span className="sr-only sm:hidden">Display and accessibility settings</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div id="display-panel" role="dialog" aria-label="Display and accessibility settings" className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-base font-bold">Display &amp; accessibility</h2><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X className="size-4" /></button></div>
            <Group legend="Colour theme" k="theme" options={[["light", "Light"], ["dark", "Dark"], ["contrast", "High contrast"]]} />
            <Group legend="Text size" k="text" options={[["md", "Normal"], ["lg", "Large"], ["xl", "Extra large"]]} />
            <Toggle label="Easy-to-read font" hint="Atkinson Hyperlegible, designed for low vision." on={p.font === "readable"} onChange={(v) => set("font", v ? "readable" : "default")} />
            <Toggle label="Reduce motion" hint="Turns off animations and transitions." on={p.motion === "reduce"} onChange={(v) => set("motion", v ? "reduce" : "full")} />
            <button type="button" onClick={reset} className="mt-5 text-sm font-medium text-accent underline underline-offset-4">Reset to defaults</button>
          </div>
        </>
      )}
    </div>
  );
}
