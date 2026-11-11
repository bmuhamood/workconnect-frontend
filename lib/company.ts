/** Company profile content (Work Connect UG Ltd). Single source for the home, about and services pages. */
export const COMPANY = {
  name: "Work Connect UG Ltd",
  tagline: "Connecting Businesses with the Right Talent",
  strap: "Professional Recruitment • HR Outsourcing • Payroll Management • Workforce Solutions",
  about: [
    "Work Connect UG Ltd is a professional Human Resource, Recruitment and Workforce Management company based in Uganda, dedicated to connecting employers with qualified, reliable and well-trained personnel across multiple industries.",
    "We specialise in sourcing, screening, assessing, training and deploying competent employees who meet our clients' operational and organisational requirements. Our commitment is to deliver workforce solutions that enhance productivity, reduce recruitment risks and support sustainable business growth.",
    "Beyond recruitment, we offer comprehensive HR outsourcing, including payroll administration, workforce management, employee documentation, compliance support and end-to-end HR services.",
  ],
  vision: "To become Uganda's leading and most trusted provider of professional recruitment, workforce outsourcing and human resource solutions.",
  mission: "To connect organisations with competent, well-trained and thoroughly vetted professionals while delivering innovative, reliable and ethical HR solutions that create value for both employers and job seekers.",
  values: ["Professionalism", "Integrity", "Excellence", "Accountability", "Reliability", "Confidentiality", "Customer satisfaction", "Innovation", "Respect for people", "Continuous improvement"],
  commitment: "People are every organisation's greatest asset. Every candidate entrusted to our clients is carefully selected, screened, assessed and prepared to meet workplace expectations. Whether you need one employee or an entire workforce, we remain your trusted partner in recruitment, HR outsourcing, payroll administration and workforce management.",
} as const;

export const RECRUITMENT_STEPS = ["Application & registration", "Document verification", "Background screening", "Competency assessment", "Interview evaluation", "Skills testing", "Reference checks", "Medical examination (where applicable)", "Workplace readiness training", "Final deployment"] as const;
export const RECRUITMENT_INCLUDES = ["Candidate sourcing", "CV screening", "Interviews", "Competency assessments", "Background verification", "Reference checks", "Medical screening (where required)", "Documentation verification", "Candidate deployment"] as const;
export const HR_OUTSOURCING = ["Payroll management", "Staff administration", "Contract management", "Employee records management", "HR compliance", "Attendance management", "Performance support", "Staff welfare coordination", "Exit management", "End-to-end HR administration"] as const;
export const TRAINING = ["Professional conduct", "Customer service", "Workplace ethics", "Communication skills", "Time management", "Safety procedures", "Personal grooming", "Teamwork", "Confidentiality", "Employer expectations"] as const;

export const PERSONNEL: { sector: string; roles: string[] }[] = [
  { sector: "Domestic & home services", roles: ["Professional maids", "Nannies", "Caregivers", "General helpers", "Gardeners", "Cleaners"] },
  { sector: "Hospitality & tourism", roles: ["Chefs", "Bakers", "Waiters & waitresses", "Hotel attendants", "Housekeepers", "Kitchen assistants"] },
  { sector: "Security services", roles: ["Security guards", "Watchmen", "Security personnel"] },
  { sector: "Agriculture", roles: ["Farm workers", "Agricultural labourers", "Garden supervisors"] },
  { sector: "Transportation & logistics", roles: ["Drivers (all categories)", "Truck drivers", "Bus drivers", "Delivery drivers", "Forklift operators"] },
  { sector: "Healthcare support", roles: ["Caregivers", "Home health assistants", "Patient support personnel"] },
  { sector: "Education", roles: ["Teachers", "Teaching assistants", "School support staff"] },
  { sector: "Retail & customer service", roles: ["Supermarket & shop attendants", "Cashiers", "Customer service representatives", "Sales representatives & executives"] },
  { sector: "Marketing", roles: ["Brand promoters", "Marketers", "Sales promoters", "Business development personnel"] },
  { sector: "Beauty & wellness", roles: ["Salon stylists", "Barbers", "Nail technicians", "Beauty therapists"] },
  { sector: "Construction & engineering", roles: ["Welders", "Plumbers", "Masons", "Painters", "Electricians", "Carpenters", "Construction workers"] },
  { sector: "Manufacturing", roles: ["Factory workers", "Machine operators", "Production assistants", "Packers"] },
  { sector: "Cleaning & environmental", roles: ["Professional cleaners", "Fumigators", "Sanitation workers"] },
  { sector: "Creative & digital", roles: ["Graphic designers", "Photographers", "Videographers", "Digital content creators"] },
  { sector: "Fitness & recreation", roles: ["Gym attendants", "Fitness assistants"] },
  { sector: "IT & other skilled roles", roles: ["IT professionals", "Developers", "Other skilled & semi-skilled personnel"] },
];

export const WHY_US = ["Professionally screened candidates", "Well-trained personnel", "Fast recruitment turnaround", "Extensive candidate database", "Flexible recruitment models", "HR outsourcing expertise", "Payroll management solutions", "Reduced recruitment costs", "Confidential recruitment process", "Ongoing client support", "Quality assurance across the employment lifecycle"] as const;
export const INDUSTRIES = ["Hotels", "Restaurants", "Schools", "Hospitals", "Homes", "NGOs", "Manufacturing companies", "Construction companies", "Agricultural enterprises", "Supermarkets", "Retail stores", "Security companies", "Logistics companies", "Warehousing", "Corporate offices", "Financial institutions", "Government agencies", "Private businesses", "Industrial facilities"] as const;
export const PARTNERS = ["Recruitment agencies", "HR consulting firms", "International recruitment companies", "Labour export agencies", "NGOs", "Corporate organisations", "Government institutions", "Development partners", "Educational institutions", "Hospitality groups", "Manufacturing companies"] as const;
export const GLOBIS = {
  name: "GLOBIS HR Solutions Ltd",
  text: "We collaborate with GLOBIS HR Solutions Ltd for external recruitment, and work with other reputable HR organisations to deliver efficient recruitment, workforce deployment, HR outsourcing and talent management.",
  benefits: ["Access to qualified talent pools", "Efficient recruitment processes", "Consistent quality standards", "Ethical recruitment practices", "Timely workforce deployment", "Compliance with labour regulations", "Long-term workforce sustainability"],
} as const;
