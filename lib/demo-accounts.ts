/** Demo logins created by `npm run db:seed`. Shown on the login page only when demo login is enabled. */
export const DEMO_PASSWORD = "Password123!";
export type DemoAccount = { email: string; label: string; org: string; note: string };

const WC = "WorkConnect (the HR provider)";
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "superadmin@workconnect.ug", label: "Super WorkConnect Admin", org: WC, note: "Adds clients, invites consultants, manages packages and enquiries at /platform" },
  { email: "owner@workconnect.ug", label: "WorkConnect consultant: Daniel Mwesigwa", org: WC, note: "Opens any client's workspace from /platform; every entry is logged" },
  { email: "hr@workconnect.ug", label: "WorkConnect consultant: Rebecca Auma", org: WC, note: "Runs payroll and HR support inside client workspaces" },

  { email: "client1@workconnect.ug", label: "Client administrator: Nakato Family Household", org: "Nakato Family Household", note: "Has 3 employees + 1 pending offer + 1 terminated" },
  { email: "worker10@workconnect.ug", label: "Job seeker: Agnes Tendo (Receptionist)", org: "Nakato Family Household", note: "No contract; applied to jobs" },
  { email: "worker1@workconnect.ug", label: "Employee: Sarah Namukasa (Nanny)", org: "Nakato Family Household", note: "07:30–16:30, Mon–Sat, overtime 1.5×" },
  { email: "worker2@workconnect.ug", label: "Employee: John Okello (Driver)", org: "Nakato Family Household", note: "07:00–17:00, Mon–Fri, transport allowance" },
  { email: "worker3@workconnect.ug", label: "Employee: Mary Atim (Cook)", org: "Nakato Family Household", note: "09:00–18:00, Mon–Fri, leave pending" },
  { email: "worker7@workconnect.ug", label: "Employee: Lydia Nansubuga (Cleaner)", org: "Nakato Family Household", note: "Contract offer waiting for her signature" },
  { email: "worker8@workconnect.ug", label: "Former employee: Moses Ochieng (Gardener)", org: "Nakato Family Household", note: "Contract terminated" },

  { email: "client2@workconnect.ug", label: "Client administrator: Kiggundu Logistics Ltd", org: "Kiggundu Logistics Ltd", note: "Has 3 employees + 1 completed contract; overdue invoice" },
  { email: "worker4@workconnect.ug", label: "Employee: Peter Ssemanda (Security)", org: "Kiggundu Logistics Ltd", note: "06:00–18:00, Mon–Sat, overtime 2×, unpaid leave" },
  { email: "worker5@workconnect.ug", label: "Employee: Brian Mukasa (Warehouse Supervisor)", org: "Kiggundu Logistics Ltd", note: "08:00–17:00, leave rejected" },
  { email: "worker6@workconnect.ug", label: "Employee: Joan Nabukenya (Accountant)", org: "Kiggundu Logistics Ltd", note: "08:30–17:30, higher salary (PAYE bands)" },
  { email: "worker9@workconnect.ug", label: "Former employee: Betty Namaganda (House help)", org: "Kiggundu Logistics Ltd", note: "Contract completed, reviewed" },

  { email: "client3@workconnect.ug", label: "Client administrator: Lakeview Dental Clinic", org: "Lakeview Dental Clinic", note: "New client: open vacancies, no staff yet" },

  { email: "client1@globis.ug", label: "Client administrator: Lakeside Guest House", org: "Lakeside Guest House", note: "3 employees: Esther, David, Winnie" },
  { email: "worker1@globis.ug", label: "Employee: Esther Nabirye (House Manager)", org: "Lakeside Guest House", note: "Active contract" },
  { email: "worker2@globis.ug", label: "Employee: David Mugisha (Gardener)", org: "Lakeside Guest House", note: "Active contract" },
  { email: "worker4@globis.ug", label: "Employee: Winnie Nakimera (Cook)", org: "Lakeside Guest House", note: "Active contract (Lakeside Guest House)" },
  { email: "worker6@globis.ug", label: "Job seeker: Ruth Nalwoga (Housekeeper)", org: "Lakeside Guest House", note: "No contract yet" },

  { email: "client2@globis.ug", label: "Client administrator: Entebbe Fresh Produce", org: "Entebbe Fresh Produce", note: "2 employees: Samuel, Patrick" },
  { email: "worker3@globis.ug", label: "Employee: Samuel Kato (Driver)", org: "Entebbe Fresh Produce", note: "Active contract (Entebbe Fresh Produce)" },
  { email: "worker5@globis.ug", label: "Employee: Patrick Ouma (Security)", org: "Entebbe Fresh Produce", note: "Active contract (Entebbe Fresh Produce)" },
];
