import type { Metadata } from "next";
import { tdb } from "@/lib/tenant";
import { requireSession } from "@/lib/session";
import { AjaxForm, Field } from "@/components/ajax-form";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "HR settings" };
export default async function HrSettings() {
  await requireSession(["admin"]);
  const t = await tdb(async (_tx, t) => t);
  const lp = t.leavePolicy;
  return (
    <div className="mx-auto max-w-3xl">
      <AjaxForm url="/api/admin/hr-settings" method="PATCH" submit="Save HR settings" success="HR settings saved" className="space-y-6">
        <section className="card space-y-4 p-6"><h2 className="text-lg font-bold">Working hours</h2>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Workday starts" hint="24-hour time"><input name="workStart" defaultValue={t.workStart} required className="input" /></Field><Field label="Grace period (minutes)"><input name="lateGraceMinutes" type="number" min={0} max={120} defaultValue={t.lateGraceMinutes} className="input" /></Field><Field label="Timezone"><input name="timezone" defaultValue={t.timezone} required className="input" /></Field></div></section>
        <section className="card space-y-4 p-6"><h2 className="text-lg font-bold">Leave entitlements (working days per year)</h2><p className="text-sm text-slate-500">Starting points only. Set these to match your employment policy and the Employment Act.</p>
          <div className="grid gap-4 sm:grid-cols-5">{([["leaveAnnual", "Annual", lp.annual], ["leaveSick", "Sick", lp.sick], ["leaveMaternity", "Maternity", lp.maternity], ["leavePaternity", "Paternity", lp.paternity], ["leaveCompassionate", "Compassionate", lp.compassionate]] as const).map(([n, l, v]) => <Field key={n} label={l}><input name={n} type="number" min={0} defaultValue={v} className="input" /></Field>)}</div></section>
        <section className="card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">Payroll statutory rates</h2>{t.payrollRatesConfirmedAt ? <Badge tone="green">Confirmed {t.payrollRatesConfirmedAt.toISOString().slice(0, 10)}</Badge> : <Badge tone="amber">Not confirmed</Badge>}</div>
          <p className="text-sm text-slate-500">PAYE bands and NSSF rates change (Uganda revised PAYE for 2026/27). These defaults are a starting point. Check them against URA and NSSF guidance, adjust, and confirm. Payroll can't be approved until they're confirmed, and changing a rate asks for confirmation again.</p>
          <Field label="PAYE bands" hint='One per line: "monthly income from, rate %". Income above each figure is taxed at that rate until the next band.'><textarea name="payeBands" rows={5} defaultValue={t.payeBands} className="input font-mono" /></Field>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Employee NSSF (%)"><input name="nssfEmployeePct" type="number" step="0.1" min={0} defaultValue={t.nssfEmployeeBps / 100} className="input" /></Field><Field label="Employer NSSF (%)"><input name="nssfEmployerPct" type="number" step="0.1" min={0} defaultValue={t.nssfEmployerBps / 100} className="input" /></Field><Field label="NSSF monthly ceiling (UGX)" hint="0 = no ceiling"><input name="nssfCap" type="number" min={0} defaultValue={t.nssfCap} className="input" /></Field></div>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm"><input type="checkbox" name="confirmRates" value="on" className="mt-0.5 size-4 accent-brand-600" /><span>I have checked these PAYE and NSSF rates against current URA and NSSF guidance and confirm they are correct for payroll.</span></label></section>
      </AjaxForm>
    </div>
  );
}
