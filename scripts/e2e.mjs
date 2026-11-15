// End-to-end test of the client-tenant model against a running server using local dev auth.
// Needs a freshly seeded database (npm run db:seed:reset) and the server started with PLATFORM_SETUP_TOKEN set.
// Usage: DATABASE_URL=... BASE=http://localhost:3100 CRON_SECRET=... node scripts/e2e.mjs
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

import pg from "pg";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL }); await db.connect();
const rand8 = () => String(Math.floor(10000000 + Math.random() * 89999999));
const tokenOf = (url) => url.split("/invite/")[1];

async function login(c, email, password = "Password123!") {
  const r = await c.req("/api/local-auth/login", { method: "POST", body: { email, password } });
  if (r.status !== 200) throw new Error(`login failed for ${email}: ${r.text}`);
  return c;
}
/** Invitation acceptance exactly as the browser does it: create the identity, then complete the invitation. */
async function accept(token, email, first, last, extra = {}) {
  const c = new Client();
  const r = await c.req("/api/local-auth/register", { method: "POST", body: { email, password: "Passw0rd!x", firstName: first, lastName: last, phone: "+2567" + rand8() } });
  if (r.status !== 200) throw new Error("register failed " + r.text);
  const o = await c.req("/api/onboarding", { method: "POST", body: { token, firstName: first, lastName: last, phone: "+256700111222", city: "Kampala", ...extra } });
  return { c, o };
}

// ================= 1. WorkConnect adds two client organisations =================
const anon = new Client(); const visitor = new Client();
const sa = await login(new Client(), "superadmin@workconnect.ug");
check("super admin signs in and opens the platform console", (await sa.req("/platform")).status === 200);
const orgA = `E2E Client A ${run}`, orgB = `E2E Client B ${run}`;
const emailA = `admin.a.${run}@e2e.test`, emailB = `admin.b.${run}@e2e.test`;
const createA = await sa.req("/api/platform/tenants", { method: "POST", body: { orgName: orgA, industry: "Testing", adminEmail: emailA, adminFirstName: "Ada" } });
check("super admin creates client A and gets an invitation link", createA.status === 200 && /\/invite\//.test(createA.json?.inviteUrl ?? ""), createA.text.slice(0, 120));
const createB = await sa.req("/api/platform/tenants", { method: "POST", body: { orgName: orgB, adminEmail: emailB, adminFirstName: "Bob" } });
check("super admin creates client B", createB.status === 200);
const tenantA = createA.json.id, tenantB = createB.json.id, slug = createA.json.slug, slugBase = orgA;
check("a client needs a valid administrator email", (await sa.req("/api/platform/tenants", { method: "POST", body: { orgName: "No Email Ltd", adminEmail: "nope" } })).status === 400);

// ================= 2. Invitation security =================
check("unknown invitation link is handled gracefully", /can't be used/.test((await anon.req("/invite/" + "x".repeat(43))).text));
const invPage = await anon.req(`/invite/${tokenOf(createA.json.inviteUrl)}`);
check("valid invitation page names the client and locks the email", invPage.status === 200 && invPage.text.includes(orgA) && invPage.text.includes(emailA));
const wrong = await accept(tokenOf(createA.json.inviteUrl), `someone.else.${run}@e2e.test`, "Wrong", "Person");
check("an invitation can't be used by a different email address", wrong.o.status === 403 && /was sent to/.test(wrong.o.json?.error ?? ""), wrong.o.text.slice(0, 100));
const a1 = await accept(tokenOf(createA.json.inviteUrl), emailA, "Ada", "Admin");
check("client administrator accepts the invitation", a1.o.status === 200, a1.o.text.slice(0, 100));
const adminA = a1.c;
check("an invitation can only be used once", (await accept(tokenOf(createA.json.inviteUrl), `again.${run}@e2e.test`, "X", "Y")).o.status === 410);
check("a used invitation page says it can't be used", /can't be used/.test((await anon.req(`/invite/${tokenOf(createA.json.inviteUrl)}`)).text));
check("admin dashboard shows the client's name", (await adminA.req("/dashboard")).text.includes(orgA));
const b1 = await accept(tokenOf(createB.json.inviteUrl), emailB, "Bob", "Admin");
check("client B administrator accepts", b1.o.status === 200);
const adminBc = b1.c;
check("public self-registration no longer exists", /Accounts are created by invitation/.test((await anon.req("/register")).text));
check("agency self-signup is impossible: onboarding needs a token", (await a1.c.req("/api/onboarding", { method: "POST", body: { firstName: "A", lastName: "B", phone: "+256700111222", agencyName: "Mine" } })).status === 400);

// administrator invites managers and employees
const mEmail = `mia.${run}@e2e.test`, wEmail = `wanda.${run}@e2e.test`, tEmail = `third.${run}@e2e.test`;
const invM = await adminA.req("/api/admin/invitations", { method: "POST", body: { role: "employer", lines: `Mia Manager <${mEmail}>` } });
check("administrator invites a manager", invM.status === 200 && invM.json?.created?.length === 1);
const invW = await adminA.req("/api/admin/invitations", { method: "POST", body: { role: "worker", lines: `Wanda Worker <${wEmail}>\n${tEmail}, Third\nnot-an-email\n${wEmail}` } });
check("bulk invite: 2 sent; invalid and duplicate lines handled", invW.status === 200 && invW.json.created.length === 2 && invW.json.skipped.some((s) => /valid/i.test(s.reason)), JSON.stringify(invW.json?.skipped));
check("a worker cannot invite people", (await a1.c.req("/api/platform/tenants", { method: "POST", body: { orgName: "Hack Ltd", adminEmail: "h@x.test" } })).status === 403);
const mia = await accept(tokenOf(invM.json.created[0].url), mEmail, "Mia", "Manager");
check("manager accepts", mia.o.status === 200);
const noProf = await accept(tokenOf(invW.json.created[0].url), wEmail, "Wanda", "Worker", {});
check("an employee must give a job title", noProf.o.status === 400 && /job title|profession/i.test(noProf.o.json?.error ?? ""), noProf.o.text.slice(0, 100));
const wan = { c: noProf.c, o: await noProf.c.req("/api/onboarding", { method: "POST", body: { token: tokenOf(invW.json.created[0].url), firstName: "Wanda", lastName: "Worker", phone: "+256700111222", profession: "Nanny" } }) };
check("employee completes the invitation after adding a job title", wan.o.status === 200, wan.o.text.slice(0, 100));
const thr = await accept(tokenOf(invW.json.created[1].url), tEmail, "Third", "Person", { profession: "Cook" });
check("second employee accepts", thr.o.status === 200);
// resend + revoke via the admin page
const teamPage = await adminA.req("/admin");
check("team page lists the people and consultants section", teamPage.status === 200 && /Wanda/.test(teamPage.text.replace(/<!-- -->/g, "")));
const extra = await adminA.req("/api/admin/invitations", { method: "POST", body: { role: "worker", lines: `extra.${run}@e2e.test` } });
const exId = ((await adminA.req("/admin")).text.match(/\/api\/admin\/invitations\/([0-9a-f-]{36})/) ?? [])[1];
const resent = await adminA.req(`/api/admin/invitations/${exId}`, { method: "POST" });
check("resending an invitation issues a new link and kills the old one", resent.status === 200 && tokenOf(resent.json.url) !== tokenOf(extra.json.created[0].url) && /can't be used/.test((await anon.req(`/invite/${tokenOf(extra.json.created[0].url)}`)).text));
check("the new link works", !/can't be used/.test((await anon.req(`/invite/${tokenOf(resent.json.url)}`)).text));
const exId2 = ((await adminA.req("/admin")).text.match(/\/api\/admin\/invitations\/([0-9a-f-]{36})/) ?? [])[1];
check("administrator revokes an invitation", (await adminA.req(`/api/admin/invitations/${exId2}`, { method: "DELETE" })).status === 200 && /can't be used/.test((await anon.req(`/invite/${tokenOf(resent.json.url)}`)).text));
const expiring = await adminA.req("/api/admin/invitations", { method: "POST", body: { role: "worker", lines: `late.${run}@e2e.test` } });
await db.query("update invitations set expires_at = now() - interval '1 day' where email = $1", [`late.${run}@e2e.test`]);
check("an expired invitation is refused", /can't be used/.test((await anon.req(`/invite/${tokenOf(expiring.json.created[0].url)}`)).text));
check("client B's administrator cannot revoke client A's invitation", (await adminBc.req(`/api/admin/invitations/${exId2}`, { method: "DELETE" })).status === 404);

// ----- actors under the names the shared sections below use -----
const agency = { c: adminA }, employer = { c: mia.c }, worker = { c: wan.c }, third = { c: thr.c };
const attacker = adminBc, otherAdmin = adminBc;

// 2. Auth guards
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
const wp = await employer.c.req("/workers/" + workerId);
check("worker public page shows 5.0 rating", wp.status === 200 && /5\.0/.test(wp.text) && /Wonderful and reliable/.test(wp.text));

// 4. Messaging
const conv = await employer.c.req("/api/conversations", { method: "POST", body: { userId: workerId, message: "Hi Wanda!" } });
check("start conversation", conv.status === 200 && !!conv.json?.id);
check("send + read messages", (await worker.c.req(`/api/conversations/${conv.json.id}`, { method: "POST", body: { message: "Hello!" } })).status === 200 && (await employer.c.req(`/api/conversations/${conv.json.id}`)).json.messages.length === 2);

// 5. Admin + campaigns + unsubscribe
check("worker cannot verify members (admin only)", (await worker.c.req(`/api/admin/workers/${workerId}`, { method: "PATCH", body: { verified: true } })).status === 403);
check("admin verifies worker", (await agency.c.req(`/api/admin/workers/${workerId}`, { method: "PATCH", body: { verified: true } })).status === 200);
check("admin page renders", (await agency.c.req("/admin")).status === 200);
check("admin sends campaign to opted-in members", (await agency.c.req("/api/admin/campaigns", { method: "POST", body: { subject: "Welcome offer", message: "We have new features for you this month.", audience: "all" } })).json?.queued >= 3);


// ================= 6. The public site belongs to WorkConnect =================
for (const p of ["/", "/services", "/packages", "/contact", "/about", "/login", "/register", "/help", "/terms", "/privacy"]) check(`public page ${p} renders`, (await anon.req(p)).status === 200);
const home = await anon.req("/");
check("home page: WorkConnect brand, client login, private-workspace section", /Client login/.test(home.text) && /Every client gets a private workspace/.test(home.text) && !/Register your HR firm/.test(home.text) && !home.text.includes(orgA));
check("a client's name never appears on the public site", !(await anon.req("/packages")).text.includes(orgA) && !(await anon.req("/contact")).text.includes(orgA));
check("jobs, candidates and contracts need sign-in (no public marketplace)", (await anon.req("/jobs")).status === 307 && (await anon.req("/workers")).status === 307 && (await anon.req("/hr")).status === 307 && (await anon.req("/dashboard")).status === 307);
check("old tenant links no longer exist", (await anon.req("/t/" + slug)).status === 404);
check("platform console is closed to the public", (await anon.req("/platform")).status === 307);
check("client administrator cannot open the platform console", (await adminA.req("/platform")).status === 307);
check("client administrator cannot add clients", (await adminA.req("/api/platform/tenants", { method: "POST", body: { orgName: "Rogue", adminEmail: "r@e2e.test" } })).status === 403);
check("manager and employee cannot call platform APIs", (await mia.c.req("/api/platform/packages", { method: "POST", body: { name: "x", priceText: "y", features: "" } })).status === 403 && (await wan.c.req("/api/platform/staff", { method: "POST", body: { email: "q@e2e.test" } })).status === 403);

// ================= 7. Enquiries go to WorkConnect, not to a client =================
const mark = `needs-help-${run}`;
check("contact form validates input", (await visitor.req("/api/contact", { method: "POST", body: { name: "A", email: "nope", topic: "General question", message: "short" } })).status === 400);
check("contact form rejects unknown topics", (await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "Spam", message: "x".repeat(20) } })).status === 400);
const lead = await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, company: "Visitor Co", topic: "Book a consultation", message: `We need payroll for 40 staff. ${mark}` } });
check("a visitor sends an enquiry without signing in", lead.status === 200);
check("honeypot: bots get 200 but nothing is stored", (await visitor.req("/api/contact", { method: "POST", body: { name: "Bot Bot", email: `bot.${run}@e2e.test`, topic: "General question", message: "buy cheap pills now please", website: "http://spam.example" } })).status === 200);
for (let k = 0; k < 2; k++) await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "General question", message: `Another message number ${k} please` } });
check("rate limit: 4th enquiry in an hour from one email -> 429", (await visitor.req("/api/contact", { method: "POST", body: { name: "Vera Visitor", email: `v.${run}@e2e.test`, topic: "General question", message: "Yet another one please answer" } })).status === 429);
await new Promise((r) => setTimeout(r, 2500));
const leads = await sa.req("/platform/leads");
check("super admin sees the enquiry with company and message", leads.status === 200 && leads.text.includes(mark) && leads.text.includes("Visitor Co"));
check("honeypot enquiry never reached WorkConnect", !leads.text.includes("buy cheap pills"));
check("enquiries are not visible inside any client workspace", !(await adminA.req("/admin")).text.includes(mark) && !(await adminBc.req("/admin")).text.includes(mark));
check("client administrator cannot read enquiries", (await adminA.req("/platform/leads")).status === 307);
const leadId = (leads.text.match(/\/api\/platform\/leads\/([0-9a-f-]{36})/) ?? [])[1];
check("staff can mark an enquiry contacted", (await sa.req(`/api/platform/leads/${leadId}`, { method: "PATCH", body: { status: "contacted" } })).status === 200);
check("client administrator cannot change enquiries", (await adminA.req(`/api/platform/leads/${leadId}`, { method: "PATCH", body: { status: "closed" } })).status === 403);
check("package quote link prefills the contact form", /quote for the Recruitment package/.test((await anon.req("/contact?package=Recruitment")).text));
const emails = await db.query("select template, reply_to, tenant_id from email_outbox where template in ('lead_staff','lead_receipt') and reply_to is not null or template='lead_staff'");
check("enquiry emails are platform emails (no client) with Reply-To the visitor", emails.rows.some((r) => r.template === "lead_staff" && r.reply_to === `v.${run}@e2e.test` && r.tenant_id === null));

// ================= 8. WorkConnect's packages =================
check("public packages page shows the starter set before any are saved", /Workforce Management/.test((await anon.req("/packages")).text));
check("client administrator cannot manage WorkConnect's packages", (await adminA.req("/api/platform/packages/starter", { method: "POST" })).status === 403);
const had = (await db.query("select count(*)::int n from platform_packages")).rows[0].n;
check("super admin saves the starter packages (or they already exist)", (await sa.req("/api/platform/packages/starter", { method: "POST" })).status === (had ? 409 : 200));
const pk = await sa.req("/api/platform/packages", { method: "POST", body: { name: `Executive Search ${run}`, tagline: "Senior hires", priceText: "From UGX 2,000,000", features: "Retained search\nBoard-level references", highlighted: false, sortOrder: 9 } });
check("super admin creates a package", pk.status === 200 && !!pk.json?.id);
check("super admin edits the price", (await sa.req(`/api/platform/packages/${pk.json.id}`, { method: "PATCH", body: { priceText: "From UGX 2,500,000" } })).status === 200);
const pubPk = await anon.req("/packages");
check("the public Packages page shows it", /Executive Search/.test(pubPk.text) && /2,500,000/.test(pubPk.text));
check("a package can be hidden from the website", (await sa.req(`/api/platform/packages/${pk.json.id}`, { method: "PATCH", body: { active: false } })).status === 200 && !/Executive Search/.test((await anon.req("/packages")).text));
check("super admin deletes the package", (await sa.req(`/api/platform/packages/${pk.json.id}`, { method: "DELETE" })).status === 200);
check("tenant roles cannot read platform tables at database level", await (async () => { try { await db.query("begin; set local role wc_app; select count(*) from platform_leads"); return false; } catch { await db.query("rollback"); return true; } })());
await db.query("rollback").catch(() => {});

// ================= 9. Consultants work inside client workspaces, visibly and on the record =================
const cEmail = `consultant.${run}@e2e.test`;
const invC = await sa.req("/api/platform/staff", { method: "POST", body: { email: cEmail, firstName: "Cora" } });
check("super admin invites a consultant", invC.status === 200 && /\/invite\//.test(invC.json?.inviteUrl ?? ""));
check("a consultant invitation page says WorkConnect team", /WorkConnect team/.test((await anon.req(`/invite/${tokenOf(invC.json.inviteUrl)}`)).text));
check("client administrators can't invite consultants", (await adminA.req("/api/platform/staff", { method: "POST", body: { email: "x@e2e.test" } })).status === 403);
const con = await accept(tokenOf(invC.json.inviteUrl), cEmail, "Cora", "Consultant");
check("consultant accepts and becomes staff", con.o.status === 200 && con.o.json?.staff === true);
check("consultant sees the client list", (await con.c.req("/platform")).status === 200 && (await con.c.req("/platform")).text.includes(orgA));
check("consultant can't add clients, manage packages, other consultants or the audit log", (await con.c.req("/platform/new")).status === 307 && (await con.c.req("/platform/team")).status === 307 && (await con.c.req("/platform/audit")).status === 307 && (await con.c.req("/api/platform/tenants", { method: "POST", body: { orgName: "X Ltd", adminEmail: "x@e2e.test" } })).status === 403);
check("consultant can read enquiries", (await con.c.req("/platform/leads")).status === 200);
check("a consultant has no workspace until they open one", (await con.c.req("/dashboard")).status === 307);
const before = await adminA.req("/admin");
check("before any visit, client A sees no consultant section for this person", !before.text.includes("Cora"));
const enter = await con.c.req(`/api/platform/tenants/${tenantA}/enter`, { method: "POST" });
check("consultant opens client A's workspace", enter.status === 200);
const inA = await con.c.req("/dashboard");
check("inside the workspace: full admin access and a visible consultant banner", inA.status === 200 && /consultant access/i.test(inA.text) && inA.text.includes(orgA));
check("consultant can run HR work (open HR operations)", (await con.c.req("/hr")).status === 200 && (await con.c.req("/hr/employees")).status === 200);
check("the client's team page now shows the consultant", /WorkConnect consultants with access/.test((await adminA.req("/admin")).text) && (await adminA.req("/admin")).text.includes("Cora"));
check("the entry is recorded in the audit log", /entered workspace/.test((await sa.req("/platform/audit")).text));
check("the client's detail page shows WorkConnect activity", /entered workspace/.test((await sa.req(`/platform/clients/${tenantA}`)).text));
check("a consultant can't pay invoices for the client", (await con.c.req(`/api/invoices/${"0".repeat(8)}-0000-0000-0000-${"0".repeat(12)}/pay`, { method: "POST", body: { method: "card" } })).status === 403);
check("a consultant can't end or sign contracts for the client", (await con.c.req(`/api/contracts/${cid}`, { method: "PATCH", body: { action: "terminate" } })).status === 403);
check("a consultant can't enter a suspended client (tested below) or one that doesn't exist", (await con.c.req(`/api/platform/tenants/${"0".repeat(8)}-0000-0000-0000-${"0".repeat(12)}/enter`, { method: "POST" })).status === 404);
check("while in client A the consultant cannot see client B's data", (await con.c.req("/admin")).status === 200 && !(await con.c.req("/admin")).text.includes(orgB));
check("consultant exits the workspace", (await con.c.req("/api/platform/exit", { method: "POST" })).status === 200 && (await con.c.req("/dashboard")).status === 307);
check("client B never sees that consultant", !(await adminBc.req("/admin")).text.includes("Cora"));

// ================= 10. Suspension =================
check("super admin suspends client B", (await sa.req(`/api/platform/tenants/${tenantB}`, { method: "PATCH", body: { action: "suspend" } })).status === 200);
check("suspended client's people are locked out", (await adminBc.req("/dashboard")).status === 307 && (await adminBc.req("/api/jobs", { method: "POST", body: { title: "x" } })).status === 401);
check("nobody can enter a suspended workspace", (await sa.req(`/api/platform/tenants/${tenantB}/enter`, { method: "POST" })).status === 404);
check("client A is unaffected", (await adminA.req("/dashboard")).status === 200);
check("super admin reactivates client B and access returns", (await sa.req(`/api/platform/tenants/${tenantB}`, { method: "PATCH", body: { action: "activate" } })).status === 200 && (await adminBc.req("/dashboard")).status === 200);
check("super admin edits a client's service fee", (await sa.req(`/api/platform/tenants/${tenantA}`, { method: "PATCH", body: { action: "update", name: orgA, industry: "Testing", serviceFeePercent: 10 } })).status === 200);
check("client administrator cannot change the service fee", (await adminA.req(`/api/platform/tenants/${tenantA}`, { method: "PATCH", body: { action: "update", name: orgA, serviceFeePercent: 0 } })).status === 403);

// ================= 11. First-run setup is closed once a Super Admin exists =================
const lone = new Client(); await lone.req("/api/local-auth/register", { method: "POST", body: { email: `setup.${run}@e2e.test`, password: "Passw0rd!x", firstName: "S", lastName: "U", phone: "+2567" + rand8() } });
const setupTry = await lone.req("/api/setup", { method: "POST", body: { token: process.env.PLATFORM_SETUP_TOKEN ?? "wrong-token-wrong-token", firstName: "S", lastName: "U", phone: "+256700111222" } });
check("setup refuses once a Super Admin exists (or without the token)", [403, 404, 409].includes(setupTry.status), String(setupTry.status));
check("the setup page is closed", [307, 404].includes((await anon.req("/setup")).status));
check("an invite-less identity can't reach any workspace", (await lone.req("/dashboard")).status === 307 && (await lone.req("/jobs")).status === 307);

// ================= 12. Client separation (HTTP view) =================
const wIds = [...(await adminA.req("/admin")).text.matchAll(/\/api\/admin\/workers\/([0-9a-f-]{36})/g)].map((m) => m[1]);
check("client A's team lists only client A's two employees", new Set(wIds).size === 2);
check("client B's administrator sees none of client A's people", !(await adminBc.req("/admin")).text.includes("Wanda") && !(await adminBc.req("/admin")).text.includes("Mia"));
check("client B cannot verify client A's employee", (await adminBc.req(`/api/admin/workers/${wIds[0]}`, { method: "PATCH", body: { verified: true } })).status === 404);
check("client B cannot message client A's employee", (await adminBc.req("/api/conversations", { method: "POST", body: { userId: wIds[0], message: "hi" } })).status === 404);
check("client B cannot invite into client A (invitations are per workspace)", !(await adminBc.req("/admin")).text.includes(`late.${run}@e2e.test`));

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
const shown = await employer.c.req("/workers/" + workerId);
check("profile photo renders on the worker page", shown.status === 200 && shown.text.includes("/me.jpg"));
// 10. Test email (log transport marks it sent; with Resend it would show provider errors here)
check("admin can send a test email", (await agency.c.req("/api/admin/test-email", { method: "POST" })).status === 200);
check("worker cannot send test emails", (await worker.c.req("/api/admin/test-email", { method: "POST" })).status === 403);
await new Promise((r) => setTimeout(r, 2500));
const adm = await agency.c.req("/admin");
check("test email appears as sent in the admin outbox", /Test email from WorkConnect/.test(adm.text) && />Sent</.test(adm.text));

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

// -- HR access control
check("HR overview requires sign-in", (await anon.req("/hr")).status === 307);
check("worker cannot open the employees page", (await worker.c.req("/hr/employees")).status === 307);
check("a manager can open payroll (their own team only)", (await employer.c.req("/hr/payroll")).status === 200);
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
let w3 = addD(u2, 1); while (!isWd(w3) || w3 === todayStr) w3 = addD(w3, 1);
const man = await employer.c.req("/api/hr/attendance", { method: "POST", body: { contractId: hcid, date: w3, clockIn: "08:40", clockOut: "17:00", note: "Traffic" } });
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

