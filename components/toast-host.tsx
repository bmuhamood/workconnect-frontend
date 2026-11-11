"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type T = { id: number; message: string; type: "ok" | "error" };
export function ToastHost() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as Omit<T, "id">;
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { ...d, id }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 4000);
    };
    window.addEventListener("wc-toast", h);
    return () => window.removeEventListener("wc-toast", h);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-rise items-center gap-2 rounded-xl border border-slate-300/60 bg-white px-4 py-3 text-sm text-slate-900 shadow-2xl">
          {t.type === "ok" ? <CheckCircle2 className="size-4 text-emerald-700" /> : <XCircle className="size-4 text-rose-700" />}{t.message}
        </div>
      ))}
    </div>
  );
}
