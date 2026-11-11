import type { Metadata } from "next";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui";
import { COMPANY, GLOBIS, PARTNERS } from "@/lib/company";

export const metadata: Metadata = { title: "About Work Connect UG Ltd" };
export default function About() {
  return (
    <div className="container-x max-w-4xl py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About {COMPANY.name}</h1>
      <p className="mt-2 text-lg text-slate-600">{COMPANY.tagline}</p>
      <div className="mt-8 space-y-4 text-slate-700">{COMPANY.about.map((t) => <p key={t}>{t}</p>)}</div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <section className="card p-6"><h2 className="text-xl font-bold">Vision</h2><p className="mt-2 text-slate-700">{COMPANY.vision}</p></section>
        <section className="card p-6"><h2 className="text-xl font-bold">Mission</h2><p className="mt-2 text-slate-700">{COMPANY.mission}</p></section>
      </div>
      <section className="mt-10"><h2 className="text-xl font-bold">Our core values</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{COMPANY.values.map((v) => <li key={v} className="card flex items-center gap-2 p-4 font-medium"><Check className="size-4 text-signal" aria-hidden="true" />{v}</li>)}</ul></section>
      <section className="card mt-10 p-6"><h2 className="text-xl font-bold">Our commitment</h2><p className="mt-2 text-slate-700">{COMPANY.commitment}</p></section>
      <section className="card mt-5 p-6"><h2 className="text-xl font-bold">Partnerships</h2><p className="mt-2 text-slate-700">{GLOBIS.text}</p>
        <p className="mt-4 text-sm font-semibold">We welcome strategic partnerships with:</p><ul className="mt-2 flex flex-wrap gap-2">{PARTNERS.map((t) => <li key={t} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">{t}</li>)}</ul></section>
      <div className="mt-10 flex flex-wrap gap-3"><LinkButton href="/contact?topic=consultation" size="lg">Book a consultation</LinkButton><LinkButton href="/services" variant="secondary" size="lg">Our services</LinkButton></div>
    </div>
  );
}
