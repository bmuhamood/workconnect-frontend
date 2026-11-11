export const DEFAULT_CATEGORIES: [string, string, string][] = [
  ["House Help & Maids", "house-help", "home"], ["Nannies & Childcare", "childcare", "baby"],
  ["Cooks, Chefs & Bakers", "cooks", "chef-hat"], ["Drivers & Logistics", "drivers", "car"],
  ["Security Guards", "security", "shield"], ["Gardeners & Agriculture", "gardeners", "leaf"],
  ["Cleaners & Sanitation", "cleaners", "sparkles"], ["Caregivers & Healthcare Support", "caregivers", "heart-pulse"],
  ["Hospitality & Tourism", "hospitality", "concierge-bell"], ["Education & School Support", "education", "graduation-cap"],
  ["Retail & Customer Service", "retail", "shopping-bag"], ["Sales & Marketing", "marketing", "megaphone"],
  ["Beauty & Wellness", "beauty", "scissors"], ["Construction & Engineering", "construction", "hammer"],
  ["Manufacturing & Production", "manufacturing", "factory"], ["Creative & Digital", "creative", "camera"],
  ["Fitness & Recreation", "fitness", "dumbbell"], ["IT & Professional", "it-professional", "laptop"],
];

export const DEFAULT_PACKAGES = [
  { name: "Recruitment & Placement", tagline: "Screened, assessed and trained people, placed on permanent, contract, temporary or casual terms.", priceText: "Custom quote", billingNote: "Priced by number of roles and seniority", highlighted: false,
    features: ["Role scoping and job brief", "Candidate sourcing and screening", "Interviews and a ranked shortlist", "ID and reference checks", "Offer, contract and placement", "Replacement support (terms set out in your agreement)"] },
  { name: "Workforce Management", tagline: "Recruitment plus the day-to-day running of your people: contracts, attendance, leave and payroll.", priceText: "Custom quote", billingNote: "Priced by headcount", highlighted: true,
    features: ["Everything in Recruitment & Placement", "Employee records and digital contracts", "Leave and attendance management", "Monthly payroll with payslips and overtime", "PAYE and NSSF calculations", "HR helpdesk for your staff"] },
  { name: "Full HR Outsourcing", tagline: "A dedicated HR partner for your whole business.", priceText: "Custom quote", billingNote: "Scoped to your organisation", highlighted: false,
    features: ["Everything in Workforce Management", "A named HR consultant", "HR policies and employee handbook", "Performance management", "Compliance reviews and reporting", "Priority support"] },
] as const;
