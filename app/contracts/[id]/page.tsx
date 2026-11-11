import { notFound } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { CheckCircle2, Circle } from "lucide-react";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { contracts, users, reviews } from "@/db/schema";
import { StatusBadge, Avatar } from "@/components/ui";
import { ActionButton } from "@/components/action-button";
import { TerminateButton } from "@/components/terminate-button";
import { AjaxForm, Field } from "@/components/ajax-form";
import { ugx } from "@/lib/format";
import { describeSchedule, hourlyRate } from "@/lib/hr-calc";

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await requireSession();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const d = await tdb(async (tx) => {
    const [c] = await tx.select().from(contracts).where(eq(contracts.id, id)).limit(1);
    if (!c || (s.role !== "admin" && c.employerId !== s.userId && c.workerId !== s.userId)) return null;
    const people = await tx.select({ id: users.id, first: users.firstName, last: users.lastName, email: users.email }).from(users).where(sql`${users.id} in (${c.employerId}, ${c.workerId})`);
    const mineReview = (await tx.select().from(reviews).where(and(eq(reviews.contractId, id), eq(reviews.reviewerId, s.userId)))).length > 0;
    return { c, people, mineReview };
  });
  if (!d) notFound();
  const { c, people, mineReview } = d;
  const emp = people.find((p) => p.id === c.employerId), wrk = people.find((p) => p.id === c.workerId);
  const isAdmin = s.role === "admin";
  const isEmployer = s.userId === c.employerId || isAdmin, isParty = isEmployer || s.userId === c.workerId;
  const iSigned = isEmployer ? c.signedByEmployer : c.signedByWorker;
  const Sig = ({ ok, who }: { ok: boolean; who: string }) => <div className="flex items-center gap-2 text-sm">{ok ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5 text-slate-300" />}{who} {ok ? "signed" : "has not signed"}</div>;
  return (
    <div className="container-x max-w-3xl py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold tracking-tight">{c.title}</h1><StatusBadge status={c.status} /></div>
      <div className="card divide-y divide-slate-100">
        <div className="grid gap-4 p-6 sm:grid-cols-2">{[["Employer", emp], ["Worker", wrk]].map(([label, p]) => { const pp = p as typeof emp; return <div key={label as string} className="flex items-center gap-3"><Avatar name={`${pp?.first} ${pp?.last}`} /><div><div className="text-xs text-slate-400">{label as string}</div><div className="font-medium">{pp?.first} {pp?.last}</div></div></div>; })}</div>
        <dl className="grid gap-4 p-6 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-400">Monthly salary</dt><dd className="font-semibold">{ugx(c.salary)}</dd></div>
          <div><dt className="text-slate-400">Platform service fee</dt><dd className="font-semibold">{ugx(c.serviceFee)}</dd></div>
          <div><dt className="text-slate-400">Start date</dt><dd className="font-semibold">{c.startDate}</dd></div>
          <div><dt className="text-slate-400">Hours per week</dt><dd className="font-semibold">{c.hoursPerWeek}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-400">Working hours &amp; overtime</dt><dd>{describeSchedule(c)}</dd><dd className="mt-1 text-slate-500">Hourly rate for overtime is calculated from the monthly salary: about {ugx(Math.round(hourlyRate(c.salary, c)))} per hour (× {c.overtimeRateBps / 10000} for overtime).</dd></div>
          {c.location && <div className="sm:col-span-2"><dt className="text-slate-400">Location</dt><dd className="font-semibold">{c.location}</dd></div>}
          {c.description && <div className="sm:col-span-2"><dt className="text-slate-400">Terms & duties</dt><dd className="whitespace-pre-line">{c.description}</dd></div>}
          {c.terminationReason && <div className="sm:col-span-2"><dt className="text-slate-400">Termination reason</dt><dd>{c.terminationReason}</dd></div>}
        </dl>
        <div className="space-y-2 p-6"><Sig ok={c.signedByEmployer} who="Employer" /><Sig ok={c.signedByWorker} who="Worker" /></div>
      </div>
      {isParty && <div className="mt-6 flex flex-wrap gap-3">
        {c.status === "pending_signature" && !iSigned && !isAdmin && <ActionButton url={`/api/contracts/${c.id}`} data={{ action: "sign" }} size="md" success="Contract signed">Sign contract</ActionButton>}
        {c.status === "active" && isEmployer && <ActionButton url={`/api/contracts/${c.id}`} data={{ action: "complete" }} size="md" variant="soft" confirm="Mark this contract as completed?" success="Contract completed">Mark completed</ActionButton>}
        {(c.status === "active" || c.status === "pending_signature") && <TerminateButton contractId={c.id} pending={c.status === "pending_signature"} />}
      </div>}
      {isParty && c.status === "completed" && !mineReview && (
        <div className="card mt-8 p-6"><h2 className="mb-4 font-semibold">Leave a review</h2>
          <AjaxForm url="/api/reviews" submit="Submit review" success="Thanks for your review" extra={{ contractId: c.id }}>
            <Field label="Rating"><select name="rating" required className="input"><option value="">Choose…</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} ({n})</option>)}</select></Field>
            <Field label="Comment"><textarea name="comment" required rows={3} className="input" /></Field>
          </AjaxForm></div>)}
    </div>
  );
}
