"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

export type Pkg = { id?: string; name: string; tagline: string; priceText: string; billingNote: string; features: string[]; highlighted: boolean; sortOrder: number; active: boolean };
export function PackageForm({ pkg }: { pkg?: Pkg }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hi, setHi] = useState(pkg?.highlighted ?? false);
  const [active, setActive] = useState(pkg?.active ?? true);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBusy(true); setError("");
    try {
      const data = { name: f.name, tagline: f.tagline, priceText: f.priceText, billingNote: f.billingNote, features: f.features, highlighted: hi, sortOrder: Number(f.sortOrder || 0), ...(pkg ? { active } : {}) };
      await call(pkg ? `/api/admin/packages/${pkg.id}` : "/api/admin/packages", pkg ? "PATCH" : "POST", data);
      toast(pkg ? "Package saved" : "Package added"); if (!pkg) { form.reset(); setHi(false); } router.refresh();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function remove() {
    if (!pkg?.id || !window.confirm(`Delete the “${pkg.name}” package?`)) return;
    try { await call(`/api/admin/packages/${pkg.id}`, "DELETE"); toast("Package deleted"); router.refresh(); } catch (e) { toast((e as Error).message, "error"); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Package name"><input name="name" required defaultValue={pkg?.name} className="input" /></Field><Field label="Price" hint='e.g. "From UGX 500,000 / month" or "Custom quote"'><input name="priceText" required defaultValue={pkg?.priceText ?? "Custom quote"} className="input" /></Field></div>
      <Field label="Tagline"><input name="tagline" defaultValue={pkg?.tagline} className="input" /></Field>
      <Field label="Pricing note" hint="Small text under the price"><input name="billingNote" defaultValue={pkg?.billingNote} className="input" /></Field>
      <Field label="What's included" hint="One item per line"><textarea name="features" rows={6} defaultValue={pkg?.features.join("\n")} className="input" /></Field>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3"><Field label="Order"><input name="sortOrder" type="number" min={0} max={99} defaultValue={pkg?.sortOrder ?? 0} className="input !w-24" /></Field>
        <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={hi} onChange={(e) => setHi(e.target.checked)} className="size-4 accent-brand-600" />Highlight as “Most popular”</label>
        {pkg && <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-brand-600" />Visible on the website</label>}</div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="flex gap-2"><button disabled={busy} className={btn("primary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}{pkg ? "Save package" : "Add package"}</button>{pkg && <button type="button" onClick={remove} className={btn("ghost", "md")}>Delete</button>}</div>
    </form>
  );
}
