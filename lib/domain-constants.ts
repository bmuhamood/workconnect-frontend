export const DEFAULT_CATEGORIES: [string, string, string][] = [
  ["House Help", "house-help", "home"], ["Nannies & Childcare", "childcare", "baby"],
  ["Cooks & Chefs", "cooks", "chef-hat"], ["Drivers", "drivers", "car"],
  ["Security Guards", "security", "shield"], ["Gardeners", "gardeners", "leaf"],
  ["Cleaners", "cleaners", "sparkles"], ["Caregivers", "caregivers", "heart-pulse"],
];

export const DEFAULT_PACKAGES = [
  { name: "Recruitment", tagline: "Find and place the right people, properly vetted.", priceText: "Custom quote", billingNote: "Priced by number of roles and seniority", highlighted: false,
    features: ["Role scoping and job brief", "Candidate sourcing and screening", "Interviews and a ranked shortlist", "ID and reference checks", "Offer, contract and placement", "Replacement support (terms set out in your agreement)"] },
  { name: "Workforce Management", tagline: "Recruitment plus the day-to-day running of your people.", priceText: "Custom quote", billingNote: "Priced by headcount", highlighted: true,
    features: ["Everything in Recruitment", "Employee records and digital contracts", "Leave and attendance management", "Monthly payroll with payslips", "PAYE and NSSF calculations", "HR helpdesk for your staff"] },
  { name: "Full HR Outsourcing", tagline: "A dedicated HR partner for your whole business.", priceText: "Custom quote", billingNote: "Scoped to your organisation", highlighted: false,
    features: ["Everything in Workforce Management", "A named HR consultant", "HR policies and employee handbook", "Performance management", "Compliance reviews and reporting", "Priority support"] },
] as const;
