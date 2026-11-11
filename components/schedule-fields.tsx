"use client";
import { useState } from "react";
import { Field } from "@/components/ajax-form";
import { DAY_NAMES, parseWorkDays } from "@/lib/hr-calc";

/**
 * Working-hours section of a contract: start/end time, working days, break, lateness grace and overtime rate.
 * Submits `workDays` as a hidden comma-separated field (ISO weekdays 1–7) so it works inside AjaxForm.
 */
export function ScheduleFields({ defaults }: { defaults?: { workStart?: string; workEnd?: string; workDays?: string; breakMinutes?: number; lateGraceMinutes?: number; overtimeRateBps?: number } }) {
  const [days, setDays] = useState<number[]>(parseWorkDays(defaults?.workDays ?? "1,2,3,4,5"));
  const toggle = (n: number) => setDays((d) => (d.includes(n) ? d.filter((x) => x !== n) : [...d, n].sort((a, b) => a - b)));
  return (
    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-2 text-sm font-semibold">Working hours in this contract</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Work starts"><input name="workStart" type="time" required defaultValue={defaults?.workStart ?? "08:00"} className="input" /></Field>
        <Field label="Work ends"><input name="workEnd" type="time" required defaultValue={defaults?.workEnd ?? "17:00"} className="input" /></Field>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Working days</span>
        <div role="group" aria-label="Working days" className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button type="button" key={n} onClick={() => toggle(n)} aria-pressed={days.includes(n)}
              className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition ${days.includes(n) ? "border-brand-500 bg-brand-600 text-onbrand" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"}`}>{DAY_NAMES[n]}</button>
          ))}
        </div>
        <input type="hidden" name="workDays" value={days.join(",")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Unpaid break (minutes)"><input name="breakMinutes" type="number" min={0} max={240} defaultValue={defaults?.breakMinutes ?? 60} className="input" /></Field>
        <Field label="Late after (minutes grace)" hint="Clock-in later than this is 'late'"><input name="lateGraceMinutes" type="number" min={0} max={120} defaultValue={defaults?.lateGraceMinutes ?? 15} className="input" /></Field>
        <Field label="Overtime rate" hint="× the hourly rate">
          <select name="overtimeRate" defaultValue={String((defaults?.overtimeRateBps ?? 15000) / 10000)} className="input">
            <option value="1">1.0×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2.0×</option>
          </select>
        </Field>
      </div>
    </fieldset>
  );
}
