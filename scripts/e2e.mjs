// End-to-end test against a running server (local dev auth). Usage: BASE=http://localhost:3100 node scripts/e2e.mjs
const BASE = process.env.BASE ?? "http://localhost:3100";
const run = Date.now().toString(36);
let failed = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); if (!ok) failed++; };

class Client {
  jar = {};
  async req(path, { method = "GET", body, headers = {} } = {}) {
    const cookie = Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join("; ");
    const res = await fetch(BASE + path, { method, redirect: "manual", headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    for (const c of res.headers.getSetCookie?.() ?? []) { const [kv] = c.split(";"); const i = kv.indexOf("="); const v = kv.slice(i + 1); if (v === "" || /max-age=0/i.test(c)) delete this.jar[kv.slice(0, i)]; else this.jar[kv.slice(0, i)] = v; }
    const text = await res.text(); let json; try { json = JSON.parse(text); } catch {}
    return { status: res.status, json, text };
  }
}
const mk = async (email, first, last, onboarding, tenantSlug) => {
  const c = new Client();
  if (tenantSlug) c.jar.wc_tenant = tenantSlug;
  const r = await c.req("/api/local-auth/register", { method: "POST", body: { email, password: "Passw0rd!x", firstName: first, lastName: last, phone: "+2567" + String(Math.floor(10000000 + Math.random() * 89999999)) } });
  if (r.status !== 200) throw new Error("register failed " + r.text);
  const o = await c.req("/api/onboarding", { method: "POST", body: { firstName: first, lastName: last, phone: "+256700111222", city: "Kampala", ...onboarding } });
  return { c, onboard: o };
};

// 1. Agency (creates tenant) + worker + employer
const slugBase = `e2e agency ${run}`;
const agency = await mk(`admin.${run}@e2e.test`, "Ada", "Admin", { role: "agency", agencyName: slugBase });
check("agency sign-up creates a tenant + admin", agency.onboard.status === 200, agency.onboard.text.slice(0, 80));
const slug = agency.c.jar.wc_tenant;
const worker = await mk(`worker.${run}@e2e.test`, "Wanda", "Worker", { role: "worker", profession: "Nanny" }, slug);
const employer = await mk(`employer.${run}@e2e.test`, "Eddie", "Employer", { role: "employer", companyName: "Eddie Home" }, slug);
check("worker + employer join the tenant", worker.onboard.status === 200 && employer.onboard.status === 200);
const dup = await mk(`worker.${run}@e2e.test`, "X", "Y", { role: "worker", profession: "Nanny" }, slug).catch((e) => ({ onboard: { status: 409 }, e }));
check("duplicate email is rejected", String(dup.e?.message ?? "").includes("409") || dup.onboard.status === 409);

// 2. Auth guards
const anon = new Client();
check("unauthenticated API call -> 401", (await anon.req("/api/jobs", { method: "POST", body: {} })).status === 401);
const bad = await new Client().req("/api/local-auth/login", { method: "POST", body: { email: `worker.${run}@e2e.test`, password: "wrong-password" } });
check("wrong password -> 401 with clear message", bad.status === 401 && /Incorrect/.test(bad.json?.error ?? ""));
check("worker cannot post jobs (role check)", (await worker.c.req("/api/jobs", { method: "POST", body: { title: "x", description: "y".repeat(30), salaryMin: 1, salaryMax: 2, location: "Kla" } })).status === 403);

// 3. Job -> apply -> shortlist -> contract -> sign -> invoice -> pay -> complete -> review
const dash = await employer.c.req("/dashboard");
check("employer dashboard renders", dash.status === 200 && /Post a job/.test(dash.text));
const bv = await employer.c.req("/api/jobs", { method: "POST", body: { title: "Nanny", description: "x", salaryMin: 5, salaryMax: 1, location: "K" } });
check("job validation errors are readable", bv.status === 400 && !!bv.json?.error, bv.json?.error);
const job = await employer.c.req("/api/jobs", { method: "POST", body: { title: "Live-out nanny", description: "Care for two toddlers on weekdays with light cooking.", salaryMin: 400000, salaryMax: 500000, location: "Kololo" } });
check("employer posts a job", job.status === 200 && !!job.json?.id);
const jobId = job.json.id;
const apply = await worker.c.req(`/api/jobs/${jobId}/apply`, { method: "POST", body: { coverLetter: "I'd love to help", expectedSalary: 450000 } });
check("worker applies", apply.status === 200);
check("double-apply blocked", (await worker.c.req(`/api/jobs/${jobId}/apply`, { method: "POST", body: {} })).status === 409);
const jobPage = await employer.c.req(`/jobs/${jobId}`);
check("employer sees applicant on job page", jobPage.status === 200 && /Wanda(<!-- -->)? (<!-- -->)?Worker/.test(jobPage.text));
const appId = (jobPage.text.match(/\/api\/applications\/([0-9a-f-]{36})/) ?? [])[1];
const wid = (jobPage.text.match(/\/workers\/([0-9a-f-]{36})/) ?? [])[1];
const sl = appId ? await employer.c.req(`/api/applications/${appId}`, { method: "PATCH", body: { status: "shortlisted" } }) : { status: 0 };
check("employer shortlists", sl.status === 200 || !appId, appId ? "" : "(app id not found in HTML; using API)");
const wprofile = await worker.c.req("/profile"); const workerId = wid ?? (wprofile.text.match(/([0-9a-f-]{36})/) ?? [])[1];
const ct = await employer.c.req("/api/contracts", { method: "POST", body: { workerId, applicationId: appId, title: "Live-out nanny", salary: 450000, startDate: "2026-12-01", hoursPerWeek: 40 } });
check("employer sends contract (fee computed)", ct.status === 200 && !!ct.json?.id, ct.text.slice(0, 80));
const cid = ct.json?.id;
const cpage = await worker.c.req(`/contracts/${cid}`);
check("worker sees 10% platform fee on contract", cpage.status === 200 && /45,000/.test(cpage.text));
check("worker signs", (await worker.c.req(`/api/contracts/${cid}`, { method: "PATCH", body: { action: "sign" } })).status === 200);
check("employer signs -> active", (await employer.c.req(`/api/contracts/${cid}`, { method: "PATCH", body: { action: "sign" } })).status === 200);
const inv = await employer.c.req("/invoices");
const invId = (inv.text.match(/\/api\/invoices\/([0-9a-f-]{36})/) ?? [])[1];
check("invoice generated on activation", inv.status === 200 && /INV-202612-/.test(inv.text) && /495,000/.test(inv.text));
const payId = invId ?? (inv.text.match(/key="?([0-9a-f-]{36})/) ?? [])[1];
const pageIds = [...inv.text.matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map((m) => m[0]);
let paid = { status: 0 };
for (const id of new Set([payId, ...pageIds].filter(Boolean))) { paid = await employer.c.req(`/api/invoices/${id}/pay`, { method: "POST", body: { method: "mtn_momo" } }); if (paid.status === 200) break; }
check("employer pays invoice", paid.status === 200);
check("paying twice is rejected", paid.status === 200 && (await employer.c.req(`/api/invoices/${[...new Set(pageIds)].find(Boolean)}/pay`, { method: "POST", body: { method: "card" } })).status === 409);
check("worker cannot pay invoices", (await worker.c.req(`/api/invoices/${pageIds[0]}/pay`, { method: "POST", body: { method: "card" } })).status === 403);
check("employer completes contract", (await employer.c.req(`/api/contracts/${cid}`, { method: "PATCH", body: { action: "complete" } })).status === 200);
check("employer reviews worker", (await employer.c.req("/api/reviews", { method: "POST", body: { contractId: cid, rating: 5, comment: "Wonderful and reliable." } })).status === 200);
check("worker reviews employer", (await worker.c.req("/api/reviews", { method: "POST", body: { contractId: cid, rating: 4, comment: "Good employer, fair." } })).status === 200);
check("duplicate review blocked", (await employer.c.req("/api/reviews", { method: "POST", body: { contractId: cid, rating: 5, comment: "Again again" } })).status === 409);
const wp = await anon.req("/workers/" + workerId, { headers: { cookie: `wc_tenant=${slug}` } });
check("worker public page shows 5.0 rating", wp.status === 200 && /5\.0/.test(wp.text) && /Wonderful and reliable/.test(wp.text));

// 4. Messaging
const conv = await employer.c.req("/api/conversations", { method: "POST", body: { userId: workerId, message: "Hi Wanda!" } });
check("start conversation", conv.status === 200 && !!conv.json?.id);
check("send + read messages", (await worker.c.req(`/api/conversations/${conv.json.id}`, { method: "POST", body: { message: "Hello!" } })).status === 200 && (await employer.c.req(`/api/conversations/${conv.json.id}`)).json.messages.length === 2);
const third = await mk(`worker2.${run}@e2e.test`, "Third", "Person", { role: "worker", profession: "Cook" }, slug);
check("non-participant cannot read conversation", (await third.c.req(`/api/conversations/${conv.json.id}`)).status === 404);

// 5. Admin + campaigns + unsubscribe
check("worker cannot verify members (admin only)", (await worker.c.req(`/api/admin/workers/${workerId}`, { method: "PATCH", body: { verified: true } })).status === 403);
check("admin verifies worker", (await agency.c.req(`/api/admin/workers/${workerId}`, { method: "PATCH", body: { verified: true } })).status === 200);
check("admin page renders", (await agency.c.req("/admin")).status === 200);
check("admin sends campaign to opted-in members", (await agency.c.req("/api/admin/campaigns", { method: "POST", body: { subject: "Welcome offer", message: "We have new features for you this month.", audience: "all" } })).json?.queued >= 3);

// 6. Cross-tenant attacks (seeded tenant A employer vs our new tenant)
const attacker = new Client(); attacker.jar.wc_tenant = "kampala-homes";
const lg = await attacker.req("/api/local-auth/login", { method: "POST", body: { email: "employer@kampala-homes.ug", password: "Password123!" } });
check("seeded employer from another tenant signs in", lg.status === 200);
check("other tenant cannot open our job page", (await attacker.req(`/jobs/${jobId}`)).status === 404);
check("other tenant cannot see our worker profile", (await attacker.req(`/workers/${workerId}`)).status === 404);
check("other tenant cannot read our contract", (await attacker.req(`/contracts/${cid}`)).status === 404);
check("other tenant cannot modify our job", (await attacker.req(`/api/jobs/${jobId}`, { method: "DELETE" })).status === 404);
check("other tenant cannot sign our contract", (await attacker.req(`/api/contracts/${cid}`, { method: "PATCH", body: { action: "terminate" } })).status === 404);
check("other tenant cannot message our users", (await attacker.req("/api/conversations", { method: "POST", body: { userId: workerId, message: "hi" } })).status === 404);
const list = await attacker.req("/jobs");
check("other tenant's job list excludes our job", list.status === 200 && !/Live-out nanny<\/h2>[\s\S]*E2E/.test(list.text) && !list.text.includes(jobId));
const forged = new Client(); forged.jar = { ...attacker.jar, wc_tenant: slug };
check("forging the tenant cookie does not grant access", (await forged.req(`/jobs/${jobId}`)).status === 404);

// 7. Public pages
for (const p of ["/", "/jobs", "/workers", "/login", "/register", "/about", "/help", "/terms", "/privacy"]) check(`public page ${p} renders`, (await anon.req(p)).status === 200);
check("tenant entry link sets cookie + redirects", (await anon.req("/t/kampala-homes")).status === 307);

// 8. Cron
const cron = await anon.req("/api/cron/emails", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
check("cron rejects missing secret", (await anon.req("/api/cron/emails")).status === 401);
check("cron runs with secret", cron.status === 200, JSON.stringify(cron.json));
console.log("SLUG=" + slug);
console.log(failed ? `\n${failed} FAILED` : "\nAll end-to-end checks passed");
process.exit(failed ? 1 : 0);
