import { notFound } from "next/navigation";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { MapPin, CalendarClock } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { getSession } from "@/lib/session";
import { jobs, applications, users, workerProfiles, categories } from "@/db/schema";
import { Badge, StatusBadge, Avatar, LinkButton } from "@/components/ui";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ActionButton } from "@/components/action-button";
import { ugx, ugxRange, timeAgo } from "@/lib/format";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const s = await getSession();
  const data = await tdb(async (tx) => {
    const [row] = await tx.select({ j: jobs, cat: categories.name }).from(jobs).leftJoin(categories, eq(categories.id, jobs.categoryId)).where(eq(jobs.id, id)).limit(1);
    if (!row) return null;
    const owner = !!s && (s.userId === row.j.employerId || s.role === "admin");
    const apps = owner ? await tx.select({ a: applications, first: users.firstName, last: users.lastName, w: workerProfiles }).from(applications).innerJoin(users, eq(users.id, applications.workerId)).leftJoin(workerProfiles, eq(workerProfiles.userId, applications.workerId)).where(eq(applications.jobId, id)).orderBy(desc(applications.createdAt)) : [];
    const mine = s?.role === "worker" ? (await tx.select().from(applications).where(eq(applications.jobId, id))).find((a) => a.workerId === s.userId) : undefined;
    return { ...row, apps, owner, mine };
  });
  if (!data) notFound();
  const { j, cat, apps, owner, mine } = data;
  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">{cat && <Badge tone="blue">{cat}</Badge>}<StatusBadge status={j.status} /></div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{j.title}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><MapPin className="size-4" />{j.location}</span>{j.schedule && <span className="inline-flex items-center gap-1"><CalendarClock className="size-4" />{j.schedule}</span>}<span>Posted {timeAgo(j.createdAt)}</span></div>
        <div className="card mt-6 whitespace-pre-line p-6 leading-relaxed text-slate-700">{j.description}</div>
        {j.requirements && <div className="card mt-4 p-6"><h2 className="mb-2 font-semibold">Requirements</h2><p className="whitespace-pre-line text-slate-700">{j.requirements}</p></div>}
        {owner && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Applicants ({apps.length})</h2>
            {apps.length === 0 ? <div className="card p-8 text-center text-slate-500">No applications yet.</div> : (
              <div className="space-y-3">{apps.map(({ a, first, last, w }) => (
                <div key={a.id} className="card p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={`${first} ${last}`} /><div className="min-w-0 flex-1"><Link href={`/workers/${a.workerId}`} className="font-semibold hover:text-brand-600">{first} {last}</Link><div className="text-sm text-slate-500">{w?.profession} · {w?.experienceYears ?? 0} yrs{a.expectedSalary ? ` · asks ${ugx(a.expectedSalary)}` : ""}</div></div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.coverLetter && <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{a.coverLetter}</p>}
                  {(a.status === "pending" || a.status === "shortlisted") && s?.role === "employer" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {a.status === "pending" && <ActionButton url={`/api/applications/${a.id}`} data={{ status: "shortlisted" }} variant="soft" success="Shortlisted">Shortlist</ActionButton>}
                      <ActionButton url={`/api/applications/${a.id}`} data={{ status: "rejected" }} variant="secondary" confirm="Reject this applicant?">Reject</ActionButton>
                      <LinkButton href={`/workers/${a.workerId}?hire=1&app=${a.id}&job=${j.id}`} size="sm">Hire…</LinkButton>
                    </div>
                  )}
                </div>
              ))}</div>
            )}
          </section>
        )}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <div className="text-sm text-slate-500">Monthly salary</div>
          <div className="text-2xl font-bold text-brand-700">{ugxRange(j.salaryMin, j.salaryMax)}</div>
          <div className="mt-5">
            {!s ? <div className="space-y-2"><LinkButton href="/login" className="w-full">Sign in to apply</LinkButton><LinkButton href="/register" variant="secondary" className="w-full">Create account</LinkButton></div>
              : s.role !== "worker" ? <p className="text-sm text-slate-500">{owner ? "This is your job posting." : "Only workers can apply to jobs."}</p>
              : mine ? <div className="space-y-3"><div className="flex items-center gap-2 text-sm">Your application: <StatusBadge status={mine.status} /></div>{mine.status === "pending" && <ActionButton url={`/api/applications/${mine.id}`} data={{ status: "withdrawn" }} variant="secondary" confirm="Withdraw your application?">Withdraw</ActionButton>}</div>
              : j.status !== "open" ? <p className="text-sm text-slate-500">This job is no longer accepting applications.</p>
              : <AjaxForm url={`/api/jobs/${j.id}/apply`} submit="Apply now" success="Application sent">
                  <Field label="Cover note (optional)"><textarea name="coverLetter" rows={4} className="input" placeholder="Why are you a good fit?" /></Field>
                  <Field label="Expected monthly salary (UGX)"><input name="expectedSalary" type="number" min={0} className="input" /></Field>
                </AjaxForm>}
          </div>
          {owner && <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">{j.status === "open" ? <ActionButton url={`/api/jobs/${j.id}`} data={{ status: "closed" }} variant="secondary" success="Job closed">Close job</ActionButton> : <ActionButton url={`/api/jobs/${j.id}`} data={{ status: "open" }} variant="secondary" success="Job reopened">Reopen</ActionButton>}<ActionButton url={`/api/jobs/${j.id}`} method="DELETE" variant="danger" confirm="Delete this job and its applications?" redirect="/dashboard">Delete</ActionButton></div>}
        </div>
      </aside>
    </div>
  );
}
