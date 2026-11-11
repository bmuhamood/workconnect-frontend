import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { servicePackages } from "@/db/schema";
import { PageHeader, Badge } from "@/components/ui";
import { PackageForm } from "@/components/package-form";
import { ActionButton } from "@/components/action-button";

export const metadata: Metadata = { title: "Service packages" };
export default async function AdminPackages() {
  await requireSession(["admin"]);
  const list = await tdb((tx) => tx.select().from(servicePackages).orderBy(asc(servicePackages.sortOrder), asc(servicePackages.createdAt)));
  return (
    <div className="container-x max-w-4xl py-10">
      <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800">← Admin</Link>
      <PageHeader title="Service packages" subtitle="These appear on your website's Packages page and home page." />
      {list.length === 0 && (
        <div className="card mb-8 flex flex-wrap items-center justify-between gap-4 p-6"><div><div className="font-semibold">No packages yet</div><p className="text-sm text-slate-500">Start from three editable templates (Recruitment, Workforce Management, Full HR Outsourcing), or add your own below.</p></div><ActionButton url="/api/admin/packages/starter" method="POST" size="md" success="Starter packages added">Use starter packages</ActionButton></div>)}
      <div className="space-y-6">{list.map((p) => (
        <details key={p.id} className="card group p-6" open={list.length <= 3 ? false : false}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-3"><span className="font-semibold">{p.name}</span>{p.highlighted && <Badge tone="blue">Most popular</Badge>}{!p.active && <Badge>Hidden</Badge>}</span><span className="text-sm text-slate-500">{p.priceText} · edit</span></summary>
          <div className="mt-5 border-t border-slate-100 pt-5"><PackageForm pkg={{ id: p.id, name: p.name, tagline: p.tagline, priceText: p.priceText, billingNote: p.billingNote, features: p.features, highlighted: p.highlighted, sortOrder: p.sortOrder, active: p.active }} /></div>
        </details>))}</div>
      <section className="card mt-8 p-6"><h2 className="mb-4 text-lg font-bold">Add a package</h2><PackageForm /></section>
    </div>
  );
}
