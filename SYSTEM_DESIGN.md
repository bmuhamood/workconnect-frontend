# WorkConnect: system design, roles and test logins

Work Connect UG Ltd is an HR consultancy. This platform lets it (and other consultancies such as GLOBIS HR Solutions Ltd) run
recruitment, contracts, attendance, overtime, leave, payroll and HR support for many **client companies** and their **employees**.

## Who logs in, and what they can do

| Level | Role in the app | Who it is | Signs in at | Can do |
|---|---|---|---|---|
| 1 | **Super WorkConnect Admin** (`users.is_super_admin`) | The platform owner | `/login` → lands on `/platform` | Add HR consultancies (with their owner login), suspend / reactivate an organisation, deactivate any account, see platform totals. Not tied to any organisation. |
| 2 | **HR Consultancy Owner / admin** (`admin`) | Owner or HR officer of one consultancy (a *tenant*) | `/login` → `/dashboard` | Everything inside their consultancy: all clients and employees, payroll runs (create, recalculate, approve, mark paid), HR settings and statutory rates, packages, support helpdesk, terminate any contract, approve any overtime / leave. |
| 3 | **Client / employer** (`employer`) | A company or household served by the consultancy. Many per consultancy, each with its own login. | `/login` → `/dashboard` | Post jobs, hire, send contracts (with working hours), and for **their own employees only**: monitor attendance, approve/reject leave and overtime, correct attendance, terminate employment (with reason), see read-only payroll costs, pay invoices. |
| 4 | **Employee / worker** (`worker`) | A person on contract | `/login` → `/dashboard` | Clock in/out, see their contract's hours and overtime, request leave, read payslips, raise HR requests, apply for jobs. |

Isolation: every tenant table has a `tenant_id` and Postgres row-level security (`wc_app` role). A client additionally only sees rows where
`employer_id = their user id`. The super admin uses the unscoped connection on purpose and only through `/platform` routes (`platformRoute`).

## Working hours and overtime (per contract)
Each contract stores its own `work_start`, `work_end`, `work_days`, `break_minutes`, `late_grace_minutes`, `overtime_rate_bps`.
* **Late**: clock-in later than `work_start + grace` (stored as `late_minutes`).
* **Overtime**: time after `work_end` (≥ 15 min, capped at 6 h per day) or any time worked on a non-working day. Self-recorded overtime is `pending`; the client or consultancy admin approves/rejects it on **HR → Attendance**. Overtime entered by a manager is approved immediately.
* **Pay**: hourly rate = monthly salary ÷ (working days per week × 52 ÷ 12) ÷ paid hours per day. Approved overtime × the contract's rate is added to gross pay (so PAYE/NSSF apply) in that month's payroll run, shown as its own line on the run, payslip and CSV. Overtime in a month whose payroll is already approved is locked.

## Test data (seed)
```bash
npm run db:migrate        # applies migration 0005 (schedules, overtime, super admin)
npm run db:seed:reset     # WIPES the database and loads the demo data below
```
Everything is generated relative to today (Africa/Kampala). Password for **every** account: `Password123!`

To use these accounts on a deployment that has Neon Auth, set `ENABLE_DEMO_LOGIN=1` and `AUTH_SECRET` (16+ chars), redeploy, and open `/login` (the accounts are listed there). Remove both before going live.

| Email | Role |
|---|---|
| superadmin@workconnect.ug | Super WorkConnect Admin |
| owner@workconnect.ug / hr@workconnect.ug | Work Connect UG Ltd: owner / HR officer |
| client1@workconnect.ug | Nakato Family Household (3 employees, 1 offer pending, 1 terminated) |
| client2@workconnect.ug | Kiggundu Logistics Ltd (3 employees, 1 completed, overdue invoice) |
| client3@workconnect.ug | Lakeview Dental Clinic (jobs + applicants, no staff) |
| worker1…worker6@workconnect.ug | Active employees with different hours (see login page notes) |
| worker7@workconnect.ug | Contract offer waiting to be signed |
| worker8@ / worker9@workconnect.ug | Terminated / completed contracts |
| worker10@workconnect.ug | Job seeker |
| owner@globis.ug | GLOBIS HR Solutions Ltd owner (payroll rates deliberately **not** confirmed) |
| client1@globis.ug, client2@globis.ug | GLOBIS clients |
| worker1…worker6@globis.ug | GLOBIS employees / job seeker |

Seeded: payroll runs (paid, approved, draft), attendance with late days and overtime (approved, pending, rejected), leave in every status,
invoices (paid, pending, overdue), reviews, conversations with unread messages, HR tickets, contact enquiries, notifications of every kind and email history.

## Suggested test script
1. `superadmin@…` → `/platform`: see both consultancies; add one; suspend/reactivate it.
2. `owner@workconnect.ug` → HR → Payroll → open the draft run, **Recalculate**, **Approve**; open a payslip (overtime line).
3. `client1@…` → HR → Attendance: approve pending overtime; Employees → open one → **Terminate employment**.
4. `worker1@…` → HR → Attendance: read the contract-specific hours text; clock in/out; Leave → request.
5. `owner@globis.ug` → Payroll: approval is blocked until rates are confirmed in HR → Settings.
6. Any page: **Display** menu (top right) → High contrast, Large text, Easy-to-read font.
