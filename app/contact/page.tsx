import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Briefcase, Users } from "lucide-react";
import { contactInfo } from "@/lib/platform";
import { getSession } from "@/lib/session";
import { ContactForm } from "@/components/contact-form";
import { TOPICS } from "@/lib/contact-topics";

export const metadata: Metadata = { title: "Contact us", description: "Talk to WorkConnect about recruitment, payroll and HR outsourcing for your organisation." };

export default async function Contact({ searchParams }: { searchParams: Promise<{ package?: string; topic?: string }> }) {
  const sp = await searchParams;
  const s = await getSession().catch(() => null);
  const c = contactInfo();
  const rows = [
    c.email && { Icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    c.phone && { Icon: Phone, label: "Phone", value: c.phone, href: `tel:${c.phone.replace(/[^+\d]/g, "")}` },
    c.address && { Icon: MapPin, label: "Visit", value: c.address },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: string; href?: string }[];
  return (
    <div className="container-x py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
        <div>
          <h1 className="text-3xl font-bold sm:text-5xl">Let's talk about your HR</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">Tell us what your organisation needs: recruitment, payroll, HR outsourcing or a full workforce solution. WorkConnect replies by email, usually within one working day.</p>
          {rows.length > 0 && (
            <ul className="mt-9 space-y-5">
              {rows.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-400/40 bg-brand-50 text-accent"><Icon className="size-5" /></span>
                  <div><div className="text-sm text-slate-500">{label}</div>{href ? <a href={href} className="font-medium hover:text-accent-strong">{value}</a> : <div className="font-medium">{value}</div>}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/packages" className="card flex items-center gap-3 p-4"><Briefcase className="size-5 text-accent" aria-hidden="true" /><span><span className="block font-semibold">See our packages</span><span className="text-sm text-slate-600">Recruitment, workforce management, full HR outsourcing</span></span></Link>
            <Link href="/login" className="card flex items-center gap-3 p-4"><Users className="size-5 text-signal" aria-hidden="true" /><span><span className="block font-semibold">Already a client?</span><span className="text-sm text-slate-600">Sign in to your workspace</span></span></Link>
          </div>
        </div>
        <div className="relative"><ContactForm topics={TOPICS} defaults={sp.package ? { name: s?.name, email: s?.email, topic: "Package enquiry", message: `I'd like a quote for the ${sp.package.slice(0, 80)} package.\n\nOur team size and what we need: ` } : sp.topic === "consultation" ? { name: s?.name, email: s?.email, topic: "Book a consultation", message: "I'd like to book a consultation about our HR needs.\n\nOur business and team size: " } : { name: s?.name, email: s?.email }} /></div>
      </div>
    </div>
  );
}
