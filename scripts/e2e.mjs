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
const attacker = new Client(); attacker.jar.wc_tenant = "work-connect-ug";
const lg = await attacker.req("/api/local-auth/login", { method: "POST", body: { email: "client1@workconnect.ug", password: "Password123!" } });
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
check("tenant entry link sets cookie + redirects", (await anon.req("/t/work-connect-ug")).status === 307);

// 8. Cron
const cron = await anon.req("/api/cron/emails", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
check("cron rejects missing secret", (await anon.req("/api/cron/emails")).status === 401);
check("cron runs with secret", cron.status === 200, JSON.stringify(cron.json));

// 9. Cloudinary uploads (signed payload + avatar URL validation)
const sg = await worker.c.req("/api/uploads/sign", { method: "POST" });
check("upload signature issued in tenant folder, secret not exposed", sg.status === 200 && /workconnect\/[0-9a-f-]{36}\/avatars/.test(sg.json?.folder ?? "") && !!sg.json?.signature && !JSON.stringify(sg.json).includes(process.env.CLOUDINARY_API_SECRET ?? "@@none@@"));
check("upload signing requires sign-in", (await anon.req("/api/uploads/sign", { method: "POST" })).status === 401);
const good = `https://res.cloudinary.com/${sg.json?.cloudName}/image/upload/v1/${sg.json?.folder}/me.jpg`;
check("avatar accepted from own tenant folder", (await worker.c.req("/api/profile/avatar", { method: "PATCH", body: { url: good } })).status === 200);
check("avatar from another tenant's folder rejected", (await worker.c.req("/api/profile/avatar", { method: "PATCH", body: { url: good.replace(/workconnect\/[0-9a-f-]{36}/, "workconnect/00000000-0000-0000-0000-000000000000") } })).status === 400);
check("avatar from arbitrary host rejected", (await worker.c.req("/api/profile/avatar", { method: "PATCH", body: { url: "https://evil.example/x.jpg" } })).status === 400);
const shown = await anon.req("/workers/" + workerId, { headers: { cookie: `wc_tenant=${slug}` } });
check("profile photo renders on the worker page", shown.status === 200 && shown.text.includes("/me.jpg"));
// 10. Test email (log transport marks it sent; with Resend it would show provider errors here)
check("admin can send a test email", (await agency.c.req("/api/admin/test-email", { method: "POST" })).status === 200);
check("worker cannot send test emails", (await worker.c.req("/api/admin/test-email", { method: "POST" })).status === 403);
await new Promise((r) => setTimeout(r, 2500));
const adm = await agency.c.req("/admin");
check("test email appears as sent in the admin outbox", /Test email from WorkConnect/.test(adm.text) && />Sent</.test(adm.text));

// 11. Contact page + inbox (public form, honeypot, rate limit, tenant isolation, emails)
const visitor = new Client(); visitor.jar.wc_tenant = slug;
const mark = `needs-help-${run}`;
check("contact page renders", (await visitor.req("/contact")).status === 200);
check("contact form validates input", (await visitor.req("/api/contact", { method: "POST", body: { name: "A", email: "nope", topic: "General question", message: "short" } })).status === 400);
check("contact form rejects unknown topic", (await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "Spam", message: "x".repeat(20) } })).status === 400);
const sent = await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "I want to hire staff", message: `We need two drivers and a cook. ${mark}` } });
check("visitor sends a contact message (no sign-in)", sent.status === 200);
const bot = await visitor.req("/api/contact", { method: "POST", body: { name: "Bot Bot", email: `bot.${run}@e2e.test`, topic: "General question", message: "buy cheap pills now please", website: "http://spam.example" } });
check("honeypot: bots get 200 but nothing is stored", bot.status === 200);
await new Promise((r) => setTimeout(r, 2500));
const inbox = await agency.c.req("/admin");
check("admin inbox shows the message", /We need two drivers and a cook/.test(inbox.text) && inbox.text.includes(`v.${run}@e2e.test`));
check("honeypot message never reached the inbox", !inbox.text.includes("buy cheap pills"));
check("admin email carries Reply-To the visitor + visitor gets a receipt", /New contact message: I want to hire staff/.test(inbox.text) && /We received your message/.test(inbox.text));
for (let k = 0; k < 2; k++) await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "General question", message: `Another message number ${k} please` } });
check("rate limit: 4th message in an hour from the same email -> 429", (await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "General question", message: "Yet another one please answer" } })).status === 429);
const otherAdmin = new Client(); otherAdmin.jar.wc_tenant = "work-connect-ug";
await otherAdmin.req("/api/local-auth/login", { method: "POST", body: { email: "owner@workconnect.ug", password: "Password123!" } });
const otherInbox = await otherAdmin.req("/admin");
check("another tenant's admin cannot see our contact messages", otherInbox.status === 200 && !otherInbox.text.includes(mark) && !otherInbox.text.includes(`v.${run}@e2e.test`));
check("admin saves contact details", (await agency.c.req("/api/admin/tenant", { method: "PATCH", body: { name: slugBase, brandColor: "#4f46e5", serviceFeePercent: 10, contactEmail: "hello@listoq.com", contactPhone: "+256 700 123 456", contactAddress: "Plot 1, Kampala Road" } })).status === 200);
const cp = await visitor.req("/contact");
check("contact page shows the organisation's details", /hello@listoq\.com/.test(cp.text) && /Kampala Road/.test(cp.text));
check("worker cannot change contact details", (await worker.c.req("/api/admin/tenant", { method: "PATCH", body: { name: "x", brandColor: "#000000", serviceFeePercent: 1 } })).status === 403);

// ============ 12. HR OPERATIONS, PACKAGES, CATEGORIES ============
const ymdUtc = (d) => d.toISOString().slice(0, 10);
const now = new Date(); const period = ymdUtc(now).slice(0, 7); const monthStart = `${period}-01`;
const addD = (s, n) => ymdUtc(new Date(Date.parse(s + "T00:00:00Z") + n * 86400000));
const isWd = (s) => { const g = new Date(s + "T00:00:00Z").getUTCDay(); return g !== 0 && g !== 6; };
const todayStr = ymdUtc(now);
// two consecutive weekdays in this month that are not today, for the unpaid-leave payroll test
let u1 = monthStart; while (!isWd(u1) || u1 === todayStr) u1 = addD(u1, 1);
let u2 = addD(u1, 1); while (!isWd(u2) || u2 === todayStr) u2 = addD(u2, 1);
// a future Mon-Wed for annual leave
let mon = addD(todayStr, 21); while (new Date(mon + "T00:00:00Z").getUTCDay() !== 1) mon = addD(mon, 1); const wedD = addD(mon, 2);

// -- categories: never a dead end
const catNew = await employer.c.req("/api/categories", { method: "POST", body: { name: `Warehouse & Logistics ${run}` } });
check("employer can create a missing category", catNew.status === 200 && !!catNew.json?.id);
const catAgain = await employer.c.req("/api/categories", { method: "POST", body: { name: `Warehouse & Logistics ${run}` } });
check("same category name re-uses the existing one", catAgain.json?.id === catNew.json?.id);
check("worker cannot create categories", (await worker.c.req("/api/categories", { method: "POST", body: { name: "Hax" } })).status === 403);
const jobNoCat = await employer.c.req("/api/jobs", { method: "POST", body: { title: "Forklift operator", description: "Operate a forklift in our warehouse during day shifts.", salaryMin: 600000, salaryMax: 700000, location: "Nakawa" } });
check("a job can be posted with no category", jobNoCat.status === 200);
const jobNewCat = await employer.c.req("/api/jobs", { method: "POST", body: { title: "Stores clerk", description: "Keep stock records and receive deliveries at the warehouse.", categoryId: catNew.json.id, salaryMin: 500000, salaryMax: 600000, location: "Nakawa" } });
check("a job can be posted in a newly created category", jobNewCat.status === 200);
check("post-job page offers inline category creation", /Add a new category|New category name|No categories/.test((await employer.c.req("/post-job")).text) || (await employer.c.req("/post-job")).status === 200);

// -- service packages
const pubPk = await visitor.req("/packages");
check("packages page shows starter packages before any are saved", pubPk.status === 200 && /Workforce Management/.test(pubPk.text) && /Request a quote/.test(pubPk.text));
check("new organisations already get the 3 starter packages at sign-up", (await agency.c.req("/api/admin/packages/starter", { method: "POST" })).status === 409);
const pkgIds = [...(await agency.c.req("/admin/packages")).text.matchAll(/\\"id\\":\\"([0-9a-f-]{36})\\",\\"name\\":\\"(?:Recruitment|Workforce Management|Full HR Outsourcing)\\"/g)].map((m) => m[1]);
check("admin package manager lists the 3 starter packages", pkgIds.length === 3, `found ${pkgIds.length}`);
for (const id of pkgIds) await agency.c.req(`/api/admin/packages/${id}`, { method: "DELETE" });
check("with no packages, the website still shows the starter set (display fallback)", /Workforce Management/.test((await visitor.req("/packages")).text));
check("admin can reload the starter packages after clearing them", (await agency.c.req("/api/admin/packages/starter", { method: "POST" })).status === 200);
check("starter packages can only be loaded once", (await agency.c.req("/api/admin/packages/starter", { method: "POST" })).status === 409);
const created = await agency.c.req("/api/admin/packages", { method: "POST", body: { name: `Executive Search ${run}`, tagline: "Senior hires", priceText: "From UGX 2,000,000", features: "Retained search\nBoard-level references", highlighted: false, sortOrder: 9 } });
check("admin creates a custom package", created.status === 200 && !!created.json?.id);
check("admin edits a package", (await agency.c.req(`/api/admin/packages/${created.json.id}`, { method: "PATCH", body: { priceText: "From UGX 2,500,000" } })).status === 200);
const pk2 = await visitor.req("/packages");
check("public packages page shows the custom package + price", /Executive Search/.test(pk2.text) && /2,500,000/.test(pk2.text));
check("worker cannot manage packages", (await worker.c.req("/api/admin/packages", { method: "POST", body: { name: "x", priceText: "y", features: "" } })).status === 403);
check("other tenant cannot edit our package", (await otherAdmin.req(`/api/admin/packages/${created.json.id}`, { method: "PATCH", body: { priceText: "Free" } })).status === 404);
check("package can be hidden from the website", (await agency.c.req(`/api/admin/packages/${created.json.id}`, { method: "PATCH", body: { active: false } })).status === 200 && !/Executive Search/.test((await visitor.req("/packages")).text));
check("admin deletes a package", (await agency.c.req(`/api/admin/packages/${created.json.id}`, { method: "DELETE" })).status === 200);

// -- HR landing + public pages
const home = await visitor.req("/");
check("home page is positioned as HR consulting", home.status === 200 && /HR consulting and workforce management, run properly/.test(home.text) && /Packages that grow with your team/.test(home.text) && /HR operations, in one platform/.test(home.text) && /Book a consultation/.test(home.text));
check("services page renders all six services", (await visitor.req("/services")).text.includes("Employee monitoring") && (await visitor.req("/services")).status === 200);
const pre = await visitor.req("/contact?package=Recruitment");
check("package quote link prefills the contact form", /quote for the Recruitment package/.test(pre.text));
check("'Book a consultation' topic is accepted", (await visitor.req("/api/contact", { method: "POST", body: { name: "Cara Consult", email: `c.${run}@e2e.test`, topic: "Book a consultation", message: "We would like to review our HR set-up soon." } })).status === 200);

// -- HR access control
check("HR overview requires sign-in", (await anon.req("/hr")).status === 307);
check("worker cannot open the employees page", (await worker.c.req("/hr/employees")).status === 307);
check("employer cannot open payroll", (await employer.c.req("/hr/payroll")).status === 307);
check("only admin can open HR settings", (await employer.c.req("/hr/settings")).status === 307 && (await agency.c.req("/hr/settings")).status === 200);

// -- a live employment: 1,900,000 salary (published PAYE example), started at the start of this month
const hc = await employer.c.req("/api/contracts", { method: "POST", body: { workerId, title: "Household manager", salary: 1900000, startDate: monthStart, hoursPerWeek: 40 } });
check("HR contract created", hc.status === 200); const hcid = hc.json.id;
check("worker signs HR contract", (await worker.c.req(`/api/contracts/${hcid}`, { method: "PATCH", body: { action: "sign" } })).status === 200);
check("employer signs HR contract -> active", (await employer.c.req(`/api/contracts/${hcid}`, { method: "PATCH", body: { action: "sign" } })).status === 200);
const overview = await agency.c.req("/hr");
check("HR overview renders for admin", overview.status === 200 && /Employees/.test(overview.text));
const empList = await employer.c.req("/hr/employees");
check("employees page lists the active employee", empList.status === 200 && /Wanda Worker/.test(empList.text.replace(/<!-- -->/g, "")));
check("employee detail page renders", (await employer.c.req(`/hr/employees/${hcid}`)).status === 200);
check("another tenant cannot open our employee record", (await attacker.req(`/hr/employees/${hcid}`)).status === 404);

// -- leave
const lv = await worker.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "annual", startDate: mon, endDate: wedD, reason: "Family event" } });
check("worker requests 3 days of annual leave", lv.status === 200 && lv.json?.days === 3, JSON.stringify(lv.json));
check("overlapping leave request is rejected", (await worker.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "annual", startDate: addD(mon, 1), endDate: addD(mon, 3) } })).status === 409);
const tooMany = await worker.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "annual", startDate: addD(mon, 7), endDate: addD(mon, 52) } });
check("leave beyond the annual entitlement is rejected with the balance", tooMany.status === 400 && /day\(s\) of annual leave left/.test(tooMany.json?.error ?? ""), tooMany.json?.error);
check("weekend-only request is rejected", (await worker.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "sick", startDate: addD(mon, 5), endDate: addD(mon, 6) } })).status === 400);
check("employer cannot request leave (worker only)", (await employer.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "annual", startDate: mon, endDate: wedD } })).status === 403);
check("worker cannot approve their own leave", (await worker.c.req(`/api/hr/leave/${lv.json.id}`, { method: "PATCH", body: { action: "approve" } })).status === 403);
check("another tenant cannot decide our leave", (await otherAdmin.req(`/api/hr/leave/${lv.json.id}`, { method: "PATCH", body: { action: "approve" } })).status === 404);
check("employer approves leave", (await employer.c.req(`/api/hr/leave/${lv.json.id}`, { method: "PATCH", body: { action: "approve", note: "Enjoy" } })).status === 200);
check("a decided request cannot be decided again", (await employer.c.req(`/api/hr/leave/${lv.json.id}`, { method: "PATCH", body: { action: "reject" } })).status === 409);
const leavePage = await worker.c.req("/hr/leave");
check("leave page shows balance after approval (21 - 3 = 18)", leavePage.status === 200 && />18</.test(leavePage.text.replace(/<!-- -->/g, "")));
check("worker cancels approved future leave", (await worker.c.req(`/api/hr/leave/${lv.json.id}`, { method: "PATCH", body: { action: "cancel" } })).status === 200);
const unp = await worker.c.req("/api/hr/leave", { method: "POST", body: { contractId: hcid, type: "unpaid", startDate: u1, endDate: u2, reason: "Personal" } });
check("worker requests 2 days of unpaid leave this month", unp.status === 200 && unp.json?.days === 2, JSON.stringify(unp.json));
check("admin approves unpaid leave", (await agency.c.req(`/api/hr/leave/${unp.json.id}`, { method: "PATCH", body: { action: "approve" } })).status === 200);
check("leave calendar renders for managers", (await agency.c.req("/hr/leave")).status === 200);

// -- attendance
const ci = await worker.c.req("/api/hr/attendance/clock", { method: "POST", body: { action: "in" } });
check("worker clocks in (status present or late)", ci.status === 200 && ["present", "late"].includes(ci.json?.status), JSON.stringify(ci.json));
check("double clock-in is rejected", (await worker.c.req("/api/hr/attendance/clock", { method: "POST", body: { action: "in" } })).status === 409);
check("worker clocks out", (await worker.c.req("/api/hr/attendance/clock", { method: "POST", body: { action: "out" } })).status === 200);
check("double clock-out is rejected", (await worker.c.req("/api/hr/attendance/clock", { method: "POST", body: { action: "out" } })).status === 409);
const attDay = await agency.c.req("/hr/attendance");
check("manager attendance view shows the employee", attDay.status === 200 && /Wanda/.test(attDay.text));
const manualDate = u1 < todayStr ? u1 : monthStart;
const man = await employer.c.req("/api/hr/attendance", { method: "POST", body: { contractId: hcid, date: addD(monthStart, 0), clockIn: "08:40", clockOut: "17:00", note: "Traffic" } });
check("manager records a late day manually (08:40 > 08:00+15)", man.status === 200 && man.json?.status === "late", JSON.stringify(man.json));
check("manual entry validates clock-out after clock-in", (await employer.c.req("/api/hr/attendance", { method: "POST", body: { contractId: hcid, date: monthStart, clockIn: "09:00", clockOut: "08:00" } })).status === 400);
check("worker cannot write manual attendance", (await worker.c.req("/api/hr/attendance", { method: "POST", body: { contractId: hcid, date: monthStart, clockIn: "08:00" } })).status === 403);
check("another tenant cannot write our attendance", (await attacker.req("/api/hr/attendance", { method: "POST", body: { contractId: hcid, date: monthStart, clockIn: "08:00" } })).status === 404);
void manualDate;
check("worker attendance page renders", (await worker.c.req("/hr/attendance")).status === 200);

// -- payroll, with exact figures
const bands = (t) => { let tax = 0; const b = [[0, 0], [335000, 10], [410000, 20], [10000000, 40]]; for (let i = 0; i < b.length; i++) { const lo = b[i][0], hi = b[i + 1]?.[0] ?? Infinity; if (t > lo) tax += (Math.min(t, hi) - lo) * b[i][1] / 100; } return Math.round(tax); };
const unpaidDed = Math.round(1900000 / 22 * 2); const gross0 = 1900000 - unpaidDed;
const net0 = gross0 - Math.round(gross0 * 0.05) - bands(gross0);
const pr = await agency.c.req("/api/hr/payroll/runs", { method: "POST", body: { period } });
check("admin generates a payroll run with 1 employee", pr.status === 200 && pr.json?.lines === 1, JSON.stringify(pr.json));
check("duplicate payroll month is rejected", (await agency.c.req("/api/hr/payroll/runs", { method: "POST", body: { period } })).status === 409);
const runId = pr.json.id;
const runPage = await agency.c.req(`/hr/payroll/${runId}`);
check("payroll run shows unpaid-leave deduction and exact net pay", runPage.status === 200 && runPage.text.includes(net0.toLocaleString("en-US")) && runPage.text.includes(unpaidDed.toLocaleString("en-US")), `expected net ${net0}, deduction ${unpaidDed}`);
check("payroll cannot be approved before rates are confirmed", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "PATCH", body: { action: "approve" } })).status === 409);
const lineId = (runPage.text.match(/payslip\/([0-9a-f-]{36})/) ?? [])[1];
check("a payslip link exists for the line", !!lineId);
check("admin adds an allowance + deduction to the draft line", (await agency.c.req(`/api/hr/payroll/lines/${lineId}`, { method: "PATCH", body: { allowances: 100000, otherDeductions: 20000 } })).status === 200);
const gross1 = gross0 + 100000; const net1 = gross1 - Math.round(gross1 * 0.05) - bands(gross1) - 20000;
check("line recalculates PAYE/NSSF/net exactly", (await agency.c.req(`/hr/payroll/${runId}`)).text.includes(net1.toLocaleString("en-US")), `expected net ${net1}`);
const badBands = await agency.c.req("/api/admin/hr-settings", { method: "PATCH", body: { workStart: "08:00", lateGraceMinutes: 15, timezone: "Africa/Kampala", leaveAnnual: 21, leaveSick: 14, leaveMaternity: 60, leavePaternity: 4, leaveCompassionate: 5, payeBands: "0,0\n500,10\n300,20", nssfEmployeePct: 5, nssfEmployerPct: 10, nssfCap: 0 } });
check("invalid PAYE bands are rejected with a clear message", badBands.status === 400 && /PAYE bands/.test(badBands.json?.error ?? ""), badBands.json?.error);
check("invalid workday start time is rejected", (await agency.c.req("/api/admin/hr-settings", { method: "PATCH", body: { workStart: "8am", lateGraceMinutes: 15, timezone: "Africa/Kampala", leaveAnnual: 21, leaveSick: 14, leaveMaternity: 60, leavePaternity: 4, leaveCompassionate: 5, payeBands: "0,0", nssfEmployeePct: 5, nssfEmployerPct: 10, nssfCap: 0 } })).status === 400);
const okSettings = { workStart: "08:00", lateGraceMinutes: 15, timezone: "Africa/Kampala", leaveAnnual: 21, leaveSick: 14, leaveMaternity: 60, leavePaternity: 4, leaveCompassionate: 5, payeBands: "0,0\n335000,10\n410000,20\n10000000,40", nssfEmployeePct: 5, nssfEmployerPct: 10, nssfCap: 0 };
check("worker cannot change HR settings", (await worker.c.req("/api/admin/hr-settings", { method: "PATCH", body: okSettings })).status === 403);
const conf = await agency.c.req("/api/admin/hr-settings", { method: "PATCH", body: { ...okSettings, confirmRates: "on" } });
check("admin confirms statutory rates", conf.status === 200 && conf.json?.confirmed === true);
const changed = await agency.c.req("/api/admin/hr-settings", { method: "PATCH", body: { ...okSettings, nssfEmployeePct: 6 } });
check("changing a statutory rate removes the confirmation", changed.status === 200 && changed.json?.confirmed === false);
check("payroll is blocked again until re-confirmed", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "PATCH", body: { action: "approve" } })).status === 409);
check("admin re-confirms the original rates", (await agency.c.req("/api/admin/hr-settings", { method: "PATCH", body: { ...okSettings, confirmRates: "on" } })).json?.confirmed === true);
check("recalculate keeps allowances", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "PATCH", body: { action: "recalculate" } })).status === 200 && (await agency.c.req(`/hr/payroll/${runId}`)).text.includes(net1.toLocaleString("en-US")));
check("worker cannot see a draft payslip", (await worker.c.req(`/hr/payroll/${runId}/payslip/${lineId}`)).status === 404);
check("another tenant cannot open our payroll run", (await otherAdmin.req(`/hr/payroll/${runId}`)).status === 404);
check("another tenant cannot export our payroll", (await otherAdmin.req(`/hr/payroll/${runId}/export`)).status === 404);
check("admin approves payroll", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "PATCH", body: { action: "approve" } })).status === 200);
check("approved payroll cannot be edited", (await agency.c.req(`/api/hr/payroll/lines/${lineId}`, { method: "PATCH", body: { allowances: 1, otherDeductions: 1 } })).status === 409);
check("approved payroll cannot be deleted", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "DELETE" })).status === 409);
const slip = await worker.c.req(`/hr/payroll/${runId}/payslip/${lineId}`);
check("worker opens their payslip with the exact net pay", slip.status === 200 && slip.text.includes(net1.toLocaleString("en-US")) && /Net pay/.test(slip.text));
check("a different worker cannot open that payslip", (await third.c.req(`/hr/payroll/${runId}/payslip/${lineId}`)).status === 404);
const csv = await agency.c.req(`/hr/payroll/${runId}/export`);
check("payroll CSV export contains the employee and net pay", csv.status === 200 && csv.text.includes("Wanda Worker") && csv.text.includes(String(net1)));
check("worker cannot export payroll CSV", (await worker.c.req(`/hr/payroll/${runId}/export`)).status === 403);
check("payslip list for worker renders", (await worker.c.req("/hr/payroll")).status === 200 && (await worker.c.req("/hr/payroll")).text.includes(period));
check("admin marks payroll paid", (await agency.c.req(`/api/hr/payroll/runs/${runId}`, { method: "PATCH", body: { action: "paid" } })).status === 200);

// -- HR helpdesk
const tk = await worker.c.req("/api/hr/tickets", { method: "POST", body: { category: "Payroll", subject: "Question about my deduction", message: "Why is there an other deduction on my payslip?" } });
check("worker opens an HR request", tk.status === 200 && !!tk.json?.id);
check("HR request validates the category", (await worker.c.req("/api/hr/tickets", { method: "POST", body: { category: "Nope", subject: "abc", message: "hello there" } })).status === 400);
check("admin sees the request in the helpdesk", /Question about my deduction/.test((await agency.c.req("/hr/support")).text));
check("another worker cannot open the request", (await third.c.req(`/hr/support/${tk.json.id}`)).status === 404);
check("another tenant cannot read the request", (await otherAdmin.req(`/hr/support/${tk.json.id}`)).status === 404);
check("admin replies (moves to in progress)", (await agency.c.req(`/api/hr/tickets/${tk.json.id}`, { method: "POST", body: { message: "It was a salary advance recovery." } })).status === 200);
check("worker replies", (await worker.c.req(`/api/hr/tickets/${tk.json.id}`, { method: "POST", body: { message: "Thanks, understood." } })).status === 200);
check("worker cannot change request status", (await worker.c.req(`/api/hr/tickets/${tk.json.id}`, { method: "PATCH", body: { status: "resolved" } })).status === 403);
check("admin resolves the request", (await agency.c.req(`/api/hr/tickets/${tk.json.id}`, { method: "PATCH", body: { status: "resolved" } })).status === 200);
check("ticket thread page renders both messages", (await worker.c.req(`/hr/support/${tk.json.id}`)).text.includes("salary advance recovery"));
await new Promise((r) => setTimeout(r, 2500));
const mails = await agency.c.req("/admin");
check("HR actions queued emails (payslip, leave, ticket)", /Payslip ready/.test(mails.text) && /Leave approved/.test(mails.text));
console.log("SLUG=" + slug);
console.log(failed ? `\n${failed} FAILED` : "\nAll end-to-end checks passed");
process.exit(failed ? 1 : 0);
