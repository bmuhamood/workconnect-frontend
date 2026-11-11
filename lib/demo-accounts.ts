/** Demo logins created by `npm run db:seed`. Shown on the login page only when demo login is enabled. */
export const DEMO_PASSWORD = "Password123!";
export type DemoAccount = { email: string; label: string; org: string; note: string };

const WC = "Work Connect UG Ltd (HR consultancy)";
const GL = "GLOBIS HR Solutions Ltd (HR consultancy)";
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "superadmin@workconnect.ug", label: "Super WorkConnect Admin", org: "Platform", note: "Sees every HR consultancy at /platform" },

  { email: "owner@workconnect.ug", label: "HR Consultancy Owner", org: WC, note: "Full control: payroll, all clients, settings" },
  { email: "hr@workconnect.ug", label: "HR Officer (admin)", org: WC, note: "Second admin of the same consultancy" },
  { email: "client1@workconnect.ug", label: "Client: Nakato Family Household", org: WC, note: "Has 3 employees + 1 pending offer + 1 terminated" },
  { email: "client2@workconnect.ug", label: "Client: Kiggundu Logistics Ltd", org: WC, note: "Has 3 employees + 1 completed contract; overdue invoice" },
  { email: "client3@workconnect.ug", label: "Client: Lakeview Dental Clinic", org: WC, note: "New client: open jobs and applicants, no staff yet" },
  { email: "worker1@workconnect.ug", label: "Employee: Sarah Namukasa (Nanny)", org: WC, note: "07:30–16:30, Mon–Sat, overtime 1.5×" },
  { email: "worker2@workconnect.ug", label: "Employee: John Okello (Driver)", org: WC, note: "07:00–17:00, Mon–Fri, transport allowance" },
  { email: "worker3@workconnect.ug", label: "Employee: Mary Atim (Cook)", org: WC, note: "09:00–18:00, Mon–Fri, leave pending" },
  { email: "worker4@workconnect.ug", label: "Employee: Peter Ssemanda (Security)", org: WC, note: "06:00–18:00, Mon–Sat, overtime 2×, unpaid leave" },
  { email: "worker5@workconnect.ug", label: "Employee: Brian Mukasa (Warehouse Supervisor)", org: WC, note: "08:00–17:00, leave rejected" },
  { email: "worker6@workconnect.ug", label: "Employee: Joan Nabukenya (Accountant)", org: WC, note: "08:30–17:30, higher salary (PAYE bands)" },
  { email: "worker7@workconnect.ug", label: "Employee: Lydia Nansubuga (Cleaner)", org: WC, note: "Contract offer waiting for her signature" },
  { email: "worker8@workconnect.ug", label: "Former employee: Moses Ochieng (Gardener)", org: WC, note: "Contract terminated" },
  { email: "worker9@workconnect.ug", label: "Former employee: Betty Namaganda (House help)", org: WC, note: "Contract completed, reviewed" },
  { email: "worker10@workconnect.ug", label: "Job seeker: Agnes Tendo (Receptionist)", org: WC, note: "No contract; applied to jobs" },

  { email: "owner@globis.ug", label: "HR Consultancy Owner", org: GL, note: "Payroll rates NOT yet confirmed (tests the safeguard)" },
  { email: "client1@globis.ug", label: "Client: Lakeside Guest House", org: GL, note: "3 employees: Esther, David, Winnie" },
  { email: "client2@globis.ug", label: "Client: Entebbe Fresh Produce", org: GL, note: "2 employees: Samuel, Patrick" },
  { email: "worker1@globis.ug", label: "Employee: Esther Nabirye (House Manager)", org: GL, note: "Active contract" },
  { email: "worker2@globis.ug", label: "Employee: David Mugisha (Gardener)", org: GL, note: "Active contract" },
  { email: "worker3@globis.ug", label: "Employee: Samuel Kato (Driver)", org: GL, note: "Active contract (Entebbe Fresh Produce)" },
  { email: "worker4@globis.ug", label: "Employee: Winnie Nakimera (Cook)", org: GL, note: "Active contract (Lakeside Guest House)" },
  { email: "worker5@globis.ug", label: "Employee: Patrick Ouma (Security)", org: GL, note: "Active contract (Entebbe Fresh Produce)" },
  { email: "worker6@globis.ug", label: "Job seeker: Ruth Nalwoga (Housekeeper)", org: GL, note: "No contract yet" },
];
