import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ShieldCheck, MapPin, Briefcase, Languages } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { getSession } from "@/lib/session";
import { workerProfiles, users, reviews, jobs } from "@/db/schema";
import { Avatar, Badge, Stars, LinkButton } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { MessageButton } from "@/components/message-button";
import { ugx, rating, timeAgo } from "@/lib/format";

const isId = (s?: string) => !!s && /^[0-9a-f-]{36}$/i.test(s);
export default async function WorkerPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ hire?: string; app?: string; job?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!isId(id)) notFound();
  const s = await getSession();
  const d = await tdb(async (tx) => {
    const [w] = await tx.select({ first: users.firstName, last: users.lastName, avatar: users.avatarUrl, p: workerProfiles }).from(workerProfiles).innerJoin(users, eq(users.id, workerProfiles.userId)).where(eq(workerProfiles.userId, id)).limit(1);
    if (!w) return null;
    const revs = await tx.select({ r: reviews, first: users.firstName, last: users.lastName }).from(reviews).innerJoin(users, eq(users.id, reviews.reviewerId)).where(eq(reviews.revieweeId, id)).orderBy(desc(reviews.createdAt)).limit(20);
    const job = isId(sp.job) ? (await tx.select().from(jobs).where(eq(jobs.id, sp.job!)).limit(1))[0] ?? null : null;
    return { w, revs, job };
  });
  if (!d) notFound();
  const { w, revs, job } = d;
  const name = `${w.first} ${w.last}`;
  const hiring = s?.role === "employer" && sp.hire === "1";
  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="card flex flex-wrap items-center gap-5 p-6">
          <Avatar name={name} src={w.avatar} size={72} />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{name}</h1>{w.p.verified && <Badge tone="green"><ShieldCheck className="size-3" />Verified</Badge>}</div><p className="text-slate-500">{w.p.profession || "Worker"}</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500"><Stars value={Number(rating(w.p.ratingAvg))} count={w.p.reviewsCount} /><span className="inline-flex items-center gap-1"><MapPin className="size-4" />{w.p.city}</span><span className="inline-flex items-center gap-1"><Briefcase className="size-4" />{w.p.experienceYears} yrs</span>{w.p.languages.length > 0 && <span className="inline-flex items-center gap-1"><Languages className="size-4" />{w.p.languages.join(", ")}</span>}</div></div>
        </div>
        <div className="card mt-4 p-6"><h2 className="mb-2 font-semibold">About</h2><p className="whitespace-pre-line text-slate-700">{w.p.bio || "This worker hasn't added a bio yet."}</p>{w.p.skills.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{w.p.skills.map((k) => <Badge key={k} tone="blue">{k}</Badge>)}</div>}</div>
        <div className="card mt-4 p-6"><h2 className="mb-4 font-semibold">Reviews ({revs.length})</h2>{revs.length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : <div className="space-y-4">{revs.map(({ r, first, last }) => <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"><div className="flex items-center justify-between"><span className="font-medium">{first} {last}</span><span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span></div><Stars value={r.rating} /><p className="mt-1 text-sm text-slate-600">{r.comment}</p></div>)}</div>}</div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <div className="text-sm text-slate-500">Expected salary</div><div className="text-2xl font-bold text-brand-700">{w.p.expectedSalary ? `${ugx(w.p.expectedSalary)}/mo` : "Negotiable"}</div>
          <div className="mt-5 space-y-2">
            {!s ? <LinkButton href="/login" className="w-full">Sign in to hire or message</LinkButton> : s.userId === id ? <p className="text-sm text-slate-500">This is your public profile.</p> : <>
              <MessageButton userId={id} />
              {s.role === "employer" && !hiring && <LinkButton href={`/workers/${id}?hire=1`} variant="secondary" className="w-full">Send contract offer</LinkButton>}
            </>}
          </div>
        </div>
        {hiring && (
          <div className="card p-6"><h2 className="mb-4 font-semibold">Contract offer</h2>
            <AjaxForm url="/api/contracts" submit="Send offer" redirect="/contracts/:id" extra={{ workerId: id, ...(isId(sp.app) ? { applicationId: sp.app } : {}) }}>
              <Field label="Job title"><input name="title" required defaultValue={job?.title ?? w.p.profession} className="input" /></Field>
              <Field label="Monthly salary (UGX)"><input name="salary" type="number" required min={1000} defaultValue={job?.salaryMin ?? (w.p.expectedSalary || undefined)} className="input" /></Field>
              <Field label="Start date"><input name="startDate" type="date" required className="input" /></Field>
              <Field label="Work location"><input name="location" defaultValue={job?.location ?? ""} className="input" /></Field>
              <Field label="Hours per week"><input name="hoursPerWeek" type="number" min={1} max={100} defaultValue={40} className="input" /></Field>
              <Field label="Terms / duties"><textarea name="description" rows={3} defaultValue={job?.description ?? ""} className="input" /></Field>
            </AjaxForm>
          </div>)}
      </aside>
    </div>
  );
}
