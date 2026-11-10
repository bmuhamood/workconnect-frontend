import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { MapPin, Clock } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { jobs, categories } from "@/db/schema";
import { PageHeader, Empty, Badge } from "@/components/ui";
import { ugxRange, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Find jobs" };
export default async function Jobs({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams;
  const { list, cats } = await tdb(async (tx) => {
    const term = q?.trim() ? `%${q.trim().replace(/[%_]/g, "")}%` : null;
    const catOk = category && /^[0-9a-f-]{36}$/i.test(category) ? category : null;
    const where = and(eq(jobs.status, "open"), catOk ? eq(jobs.categoryId, catOk) : undefined, term ? or(ilike(jobs.title, term), ilike(jobs.description, term), ilike(jobs.location, term)) : undefined);
    return { list: await tx.select({ j: jobs, cat: categories.name }).from(jobs).leftJoin(categories, eq(categories.id, jobs.categoryId)).where(where).orderBy(desc(jobs.createdAt)).limit(50), cats: await tx.select().from(categories).orderBy(categories.name) };
  });
  return (
    <div className="container-x py-10">
      <PageHeader title="Find jobs" subtitle={`${list.length} open ${list.length === 1 ? "position" : "positions"}`} />
      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={q} placeholder="Search title, description or location" className="input" />
        <select name="category" defaultValue={category ?? ""} className="input"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Search</button>
      </form>
      {list.length === 0 ? <Empty title="No jobs match your search" hint="Try a different keyword or clear the filters." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(({ j, cat }) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{j.title}</h2>{cat && <Badge tone="blue">{cat}</Badge>}</div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{j.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="size-4" />{j.location}</span><span className="inline-flex items-center gap-1"><Clock className="size-4" />{timeAgo(j.createdAt)}</span><span className="ml-auto font-medium text-brand-700">{ugxRange(j.salaryMin, j.salaryMax)}</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
