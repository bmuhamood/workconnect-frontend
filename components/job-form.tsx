"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";
import { Field } from "@/components/ajax-form";

const NEW = "__new__";
/** Job form where the category can be left empty or created on the spot, so a missing category never blocks posting. */
export function JobForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const none = categories.length === 0;
  const [cat, setCat] = useState(none ? NEW : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true); setError("");
    try {
      let categoryId: string | undefined = cat && cat !== NEW ? cat : undefined;
      if (cat === NEW && f.newCategory?.trim()) categoryId = (await call<{ id: string }>("/api/categories", "POST", { name: f.newCategory })).id;
      const { newCategory: _n, categoryId: _c, ...rest } = f; void _n; void _c;
      const out = await call<{ id: string }>("/api/jobs", "POST", { ...rest, ...(categoryId ? { categoryId } : {}) });
      toast("Job published"); router.push(`/jobs/${out.id}`); router.refresh();
    } catch (err) { setError((err as Error).message); setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Job title"><input name="title" required className="input" placeholder="e.g. Warehouse supervisor" /></Field>
      <Field label="Category" hint={none ? "No categories exist yet. Name the first one, or skip it." : "Can't find yours? Choose “Add a new category”, or leave it empty."}>
        {!none && (
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="input">
            <option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}<option value={NEW}>＋ Add a new category…</option>
          </select>)}
      </Field>
      {cat === NEW && <Field label="New category name"><input name="newCategory" maxLength={60} className="input" placeholder="e.g. Warehouse & logistics" autoFocus={!none} /></Field>}
      <Field label="Description"><textarea name="description" required rows={5} className="input" placeholder="Duties, working conditions, expectations…" /></Field>
      <Field label="Requirements (optional)"><textarea name="requirements" rows={3} className="input" /></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Min salary (UGX / month)"><input name="salaryMin" type="number" min={0} required className="input" /></Field><Field label="Max salary (UGX / month)"><input name="salaryMax" type="number" min={0} required className="input" /></Field></div>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Location"><input name="location" required className="input" placeholder="e.g. Kololo, Kampala" /></Field><Field label="Schedule (optional)"><input name="schedule" className="input" placeholder="Mon–Fri, 8am–5pm" /></Field></div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <button disabled={busy} className={btn("primary", "md")}>{busy && <Loader2 className="size-4 animate-spin" />}Publish job</button>
    </form>
  );
}
