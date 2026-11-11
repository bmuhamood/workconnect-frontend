import type { Metadata } from "next";
import { tdb } from "@/lib/tenant";
import { PackagesGrid } from "@/components/packages-grid";
import { Faq } from "@/components/faq";
import { LinkButton } from "@/components/ui";
import { getPackages } from "@/lib/packages";

export const metadata: Metadata = { title: "Packages", description: "HR service packages: recruitment, workforce management and full HR outsourcing." };
export default async function Packages() {
  const { packages, name } = await tdb(async (tx, t) => ({ packages: await getPackages(tx), name: t.name })).catch(() => ({ packages: [], name: "" }));
  return (
    <div className="container-x py-14 sm:py-20">
      <div className="max-w-2xl"><h1 className="text-3xl font-bold sm:text-5xl">Packages</h1><p className="mt-5 text-lg leading-relaxed text-slate-600">{name ? `${name} offers` : "We offer"} three ways to work together. Each is quoted to your headcount and scope, and you can move up as your team grows.</p></div>
      <div className="mt-14"><PackagesGrid packages={packages} /></div>
      <section className="mt-24"><h2 className="mb-6 text-2xl font-bold sm:text-3xl">Questions about pricing and scope</h2><Faq /></section>
      <section className="card mt-20 flex flex-wrap items-center justify-between gap-6 p-8 sm:p-10"><div><h2 className="text-2xl font-bold">Not sure which package fits?</h2><p className="mt-2 text-slate-600">Tell us about your team and we'll recommend one.</p></div><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton></section>
    </div>
  );
}
