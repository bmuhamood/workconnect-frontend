import { z } from "zod";
import { eq } from "drizzle-orm";
import { rootDb } from "@/lib/db";
import { tenants } from "@/db/schema";
import { route, body, fail } from "@/lib/http";
import { getTenant } from "@/lib/hr";
import { parseBands } from "@/lib/hr-calc";

const tzOk = (tz: string) => { try { new Intl.DateTimeFormat("en", { timeZone: tz }); return true; } catch { return false; } };
const days = z.coerce.number().int().min(0).max(365);
const schema = z.object({
  workStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time like 08:00"),
  lateGraceMinutes: z.coerce.number().int().min(0).max(120), timezone: z.string().refine(tzOk, "Unknown timezone (e.g. Africa/Kampala)"),
  leaveAnnual: days, leaveSick: days, leaveMaternity: days, leavePaternity: days, leaveCompassionate: days,
  payeBands: z.string().max(2000), nssfEmployeePct: z.coerce.number().min(0).max(30), nssfEmployerPct: z.coerce.number().min(0).max(30), nssfCap: z.coerce.number().int().min(0),
  confirmRates: z.union([z.literal("on"), z.boolean()]).optional(),
});

export const PATCH = route({ roles: ["admin"] }, async (req, { session, db }) => {
  const d = await body(req, schema);
  try { parseBands(d.payeBands); } catch (e) { throw fail(400, `PAYE bands: ${(e as Error).message}`); }
  const cur = await getTenant(db);
  const ratesChanged = cur.payeBands.trim() !== d.payeBands.trim() || cur.nssfEmployeeBps !== Math.round(d.nssfEmployeePct * 100) || cur.nssfEmployerBps !== Math.round(d.nssfEmployerPct * 100) || cur.nssfCap !== d.nssfCap;
  const confirm = d.confirmRates === "on" || d.confirmRates === true;
  // Changing any statutory rate invalidates an earlier confirmation until an admin re-confirms.
  const confirmedAt = confirm ? new Date() : ratesChanged ? null : cur.payrollRatesConfirmedAt;
  await rootDb.update(tenants).set({
    workStart: d.workStart, lateGraceMinutes: d.lateGraceMinutes, timezone: d.timezone,
    leavePolicy: { annual: d.leaveAnnual, sick: d.leaveSick, maternity: d.leaveMaternity, paternity: d.leavePaternity, compassionate: d.leaveCompassionate },
    payeBands: d.payeBands.trim(), nssfEmployeeBps: Math.round(d.nssfEmployeePct * 100), nssfEmployerBps: Math.round(d.nssfEmployerPct * 100), nssfCap: d.nssfCap,
    payrollRatesConfirmedAt: confirmedAt,
  }).where(eq(tenants.id, session.tenantId));
  return { ok: true, confirmed: !!confirmedAt };
});
