import Link from "next/link";
import type { Metadata } from "next";
import { and, desc, eq, ilike, or, lte } from "drizzle-orm";
import { ShieldCheck, MapPin } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { workerProfiles, users, categories } from "@/db/schema";
import { SetupNotice } from "@/components/setup-notice";
import { PageHeader, Empty, Avatar, Stars, Badge } from "@/components/ui";
import { ugx, rating } from "@/lib/format";

export const metadata: Metadata = { title: "Find workers" };
type SP = { q?: string; category?: string; city?: string; verified?: string; max?: string };
export default async function Workers({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  let res;
  try { res = await tdb(async (tx) => {
    const t = sp.q?.trim() ? `%${sp.q.trim().replace(/[%_]/g, "")}%` : null;
    const catOk = sp.category && /^[0-9a-f-]{36}$/i.test(sp.category) ? sp.category : null;
    const where = and(
      catOk ? eq(workerProfiles.categoryId, catOk) : undefined,
      sp.city ? ilike(workerProfiles.city, `%${sp.city.replace(/[%_]/g, "")}%`) : undefined,
      sp.verified === "1" ? eq(workerProfiles.verified, true) : undefined,
      Number(sp.max) > 0 ? lte(workerProfiles.expectedSalary, Number(sp.max)) : undefined,
      t ? or(ilike(workerProfiles.profession, t), ilike(workerProfiles.bio, t), ilike(users.firstName, t), ilike(users.lastName, t)) : undefined,
      eq(workerProfiles.availability, "available"),
    );
    return { cats: await tx.select().from(categories).orderBy(categories.name), list: await tx.select({ id: users.id, first: users.firstName, last: users.lastName, avatar: users.avatarUrl, p: workerProfiles }).from(workerProfiles).innerJoin(users, eq(users.id, workerProfiles.userId)).where(where).orderBy(desc(workerProfiles.verified), desc(workerProfiles.ratingAvg)).limit(60) };
  }); } catch (e) { console.error("[page] data load failed:", (e as Error).message.slice(0, 200)); return <SetupNotice what="Workers" />; }
  const { list, cats } = res;
  return (
    <div className="container-x py-10">
      <PageHeader title="Find workers" subtitle={`${list.length} available ${list.length === 1 ? "worker" : "workers"}`} />
      <form className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_200px_160px_160px_auto_auto]">
        <input name="q" defaultValue={sp.q} placeholder="Profession, name or skill" className="input" />
        <select name="category" defaultValue={sp.category ?? ""} className="input"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input name="city" defaultValue={sp.city} placeholder="City" className="input" />
        <input name="max" type="number" defaultValue={sp.max} placeholder="Max salary" className="input" />
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" name="verified" value="1" defaultChecked={sp.verified === "1"} className="size-4 accent-brand-600" />Verified only</label>
        <button className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-onbrand hover:bg-brand-700">Search</button>
      </form>
      {list.length === 0 ? <Empty title="No workers match your filters" hint="Try widening your search." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((w) => (
            <Link key={w.id} href={`/workers/${w.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3"><Avatar name={`${w.first} ${w.last}`} src={w.avatar} size={48} /><div className="min-w-0 flex-1"><div className="truncate font-semibold">{w.first} {w.last}</div><div className="truncate text-sm text-slate-500">{w.p.profession || "Worker"}</div></div>{w.p.verified && <Badge tone="green"><ShieldCheck className="size-3" />Verified</Badge>}</div>
              <div className="mt-4 flex flex-wrap gap-1.5">{w.p.skills.slice(0, 3).map((k) => <Badge key={k}>{k}</Badge>)}</div>
              <div className="mt-4 flex items-center justify-between text-sm"><Stars value={Number(rating(w.p.ratingAvg))} count={w.p.reviewsCount} /><span className="inline-flex items-center gap-1 text-slate-500"><MapPin className="size-4" />{w.p.city}</span></div>
              <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-500">{w.p.experienceYears} yrs exp · <span className="font-medium text-slate-800">{w.p.expectedSalary ? ugx(w.p.expectedSalary) : "Salary negotiable"}</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
