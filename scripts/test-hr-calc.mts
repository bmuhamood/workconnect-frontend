import { parseBands, payeFor, computeLine, workingDays, workingDaysWithin, monthRange, localParts, isLate } from "../lib/hr-calc";
let failed = 0;
const eq = (name: string, got: unknown, want: unknown) => { const ok = JSON.stringify(got) === JSON.stringify(want); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  got ${JSON.stringify(got)} want ${JSON.stringify(want)}`}`); if (!ok) failed++; };
const bands = parseBands("0,0\n335000,10\n410000,20\n10000000,40");
const cfg = { bands, nssfEmployeeBps: 500, nssfEmployerBps: 1000, nssfCap: 0 };

// Worked example published by The Independent (25 Jun 2026): gross 1,900,000 -> PAYE 305,500, NSSF 95,000, net 1,499,500
const r = computeLine({ basic: 1_900_000, allowances: 0, otherDeductions: 0, unpaidDays: 0 }, cfg);
eq("published example: PAYE", r.paye, 305_500); eq("published example: employee NSSF", r.nssfEmployee, 95_000); eq("published example: net pay", r.netPay, 1_499_500);
eq("employer NSSF is a cost, not deducted (10%)", r.nssfEmployer, 190_000);
eq("below the tax-free threshold pays no PAYE", payeFor(300_000, bands), 0);
eq("exactly at threshold", payeFor(335_000, bands), 0);
eq("inside the 10% band (400,000)", payeFor(400_000, bands), 6_500);
eq("NSSF cap is honoured", computeLine({ basic: 3_000_000, allowances: 0, otherDeductions: 0, unpaidDays: 0 }, { ...cfg, nssfCap: 1_000_000 }).nssfEmployee, 50_000);
const u = computeLine({ basic: 440_000, allowances: 0, otherDeductions: 0, unpaidDays: 2 }, cfg);
eq("2 unpaid days of a 22-day month", u.unpaidDeduction, 40_000); eq("gross after unpaid leave", u.gross, 400_000);
eq("allowances + other deductions", computeLine({ basic: 500_000, allowances: 50_000, otherDeductions: 20_000, unpaidDays: 0 }, cfg).netPay, 550_000 - 27_500 - payeFor(550_000, bands) - 20_000);
eq("net pay never negative", computeLine({ basic: 100_000, allowances: 0, otherDeductions: 900_000, unpaidDays: 0 }, cfg).netPay, 0);
for (const bad of ["", "100,0", "0,0\n300000,10\n200000,20", "0,0\nabc,5", "0,150"]) { let threw = false; try { parseBands(bad); } catch { threw = true; } eq(`rejects invalid bands ${JSON.stringify(bad)}`, threw, true); }
eq("working days Mon–Sun week", workingDays("2026-11-09", "2026-11-15"), 5);
eq("working days over a weekend only", workingDays("2026-11-14", "2026-11-15"), 0);
eq("leave spanning month end counts only inside the month", workingDaysWithin("2026-10-29", "2026-11-03", "2026-11-01", "2026-11-30"), 2);
eq("month range (Feb 2028 leap)", monthRange("2028-02"), { from: "2028-02-01", to: "2028-02-29" });
const t = (iso: string) => localParts(new Date(iso), "Africa/Kampala");
eq("Kampala is UTC+3 (05:20Z = 08:20 local)", t("2026-11-10T05:20:00Z"), { ymd: "2026-11-10", minutes: 500 });
eq("date rolls over in local time (22:30Z = 01:30 next day)", t("2026-11-10T22:30:00Z").ymd, "2026-11-11");
eq("08:10 with 15 min grace is on time", isLate(t("2026-11-10T05:10:00Z").minutes, "08:00", 15), false);
eq("08:20 is late", isLate(t("2026-11-10T05:20:00Z").minutes, "08:00", 15), true);
console.log(failed ? `\n${failed} FAILED` : "\nAll HR calculation checks passed"); process.exit(failed ? 1 : 0);
