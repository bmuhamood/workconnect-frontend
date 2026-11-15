import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { platformPackages } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/session";
import { Badge } from "@/components/ui";
import { PackageForm } from "@/components/package-form";
import { ActionButton } from "@/components/action-button";

export const metadata: Metadata = { title: "Packages" };
export default async function PlatformPackages() {
  await requirePlatformAdmin();
  const list = await rootDb.select().from(platformPackages).orderBy(asc(platformPackages.sortOrder), asc(platformPackages.createdAt));
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-slate-600">These are WorkConnect's service packages, shown on the public Packages page and home page.</p>
      {list.length === 0 && <div className="card flex flex-wrap items-center justify-between gap-4 p-6"><div><div className="font-semibold">No packages saved yet</div><p className="text-sm text-slate-600">The website currently shows three starter packages. Save them here to edit prices and features, or add your own.</p></div><ActionButton url="/api/platform/packages/starter" method="POST" size="md" success="Starter packages saved">Save the starter packages</ActionButton></div>}
      {list.map((p) => (
        <details key={p.id} className="card group p-6">
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-3"><span className="font-semibold">{p.name}</span>{p.highlighted && <Badge tone="blue">Most popular</Badge>}{!p.active && <Badge>Hidden</Badge>}</span><span className="text-sm text-slate-600">{p.priceText} · edit</span></summary>
          <div className="mt-5 border-t border-slate-200 pt-5"><PackageForm pkg={{ id: p.id, name: p.name, tagline: p.tagline, priceText: p.priceText, billingNote: p.billingNote, features: p.features, highlighted: p.highlighted, sortOrder: p.sortOrder, active: p.active }} /></div>
        </details>))}
      <section className="card p-6"><h2 className="mb-4 text-lg font-bold">Add a package</h2><PackageForm /></section>
    </div>
  );
}
