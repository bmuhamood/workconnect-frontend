import type { Metadata } from "next";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { categories } from "@/db/schema";
import { PageHeader } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";

export const metadata: Metadata = { title: "Post a job" };
export default async function PostJob() {
  await requireSession(["employer", "admin"]);
  const cats = await tdb((tx) => tx.select().from(categories).orderBy(categories.name));
  return (
    <div className="container-x max-w-2xl py-10">
      <PageHeader title="Post a job" subtitle="Describe the role and we'll show it to available workers." />
      <div className="card p-6">
        <AjaxForm url="/api/jobs" submit="Publish job" redirect="/jobs/:id" success="Job published">
          <Field label="Job title"><input name="title" required className="input" placeholder="e.g. Live-out nanny" /></Field>
          <Field label="Category"><select name="categoryId" className="input"><option value="">Select a category</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Description"><textarea name="description" required rows={5} className="input" placeholder="Duties, household details, expectations…" /></Field>
          <Field label="Requirements (optional)"><textarea name="requirements" rows={3} className="input" /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Min salary (UGX / month)"><input name="salaryMin" type="number" min={0} required className="input" /></Field><Field label="Max salary (UGX / month)"><input name="salaryMax" type="number" min={0} required className="input" /></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Location"><input name="location" required className="input" placeholder="e.g. Kololo, Kampala" /></Field><Field label="Schedule (optional)"><input name="schedule" className="input" placeholder="Mon–Fri, 7am–5pm" /></Field></div>
        </AjaxForm>
      </div>
    </div>
  );
}
