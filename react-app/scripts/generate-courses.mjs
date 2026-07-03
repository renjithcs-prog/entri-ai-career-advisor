import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "data", "courses.json"), "utf8"));

const SPEC_COURSES = {
  "full-stack-development": { group: "Technology", demand: "High", growth: "High", careers: ["Software Developer", "Web Developer", "Full Stack Engineer"] },
  "data-science": { group: "Technology", demand: "High", growth: "High", careers: ["Data Scientist", "ML Engineer", "Analytics Specialist"] },
  "python-programming": { group: "Technology", demand: "High", growth: "High", careers: ["Python Developer", "Automation Engineer", "Backend Developer"] },
  "software-testing": { group: "Technology", demand: "High", growth: "Growing", careers: ["QA Engineer", "Test Automation Engineer", "Quality Analyst"] },
  "data-analytics-course": { group: "Technology", demand: "High", growth: "High", careers: ["Data Analyst", "Business Analyst", "BI Specialist"] },
  "ai-tools-mastery": { group: "Technology", demand: "High", growth: "High", careers: ["Productivity Specialist", "Digital Professional", "AI-enabled roles"] },
  "ai-powered-cybersecurity": { group: "Technology", demand: "High", growth: "High", careers: ["Security Analyst", "Cybersecurity Engineer", "SOC Analyst"] },
  "architecting-on-aws": { group: "Technology", demand: "High", growth: "High", careers: ["Cloud Architect", "DevOps Engineer", "Solutions Architect"] },
  "robotics-ai-course": { group: "Technology", demand: "Medium", growth: "High", careers: ["Robotics Engineer", "Automation Specialist", "R&D Engineer"] },
  "embedded-systems": { group: "Technology", demand: "Medium", growth: "Growing", careers: ["Embedded Engineer", "Firmware Developer", "IoT Engineer"] },
  "ui-ux-design": { group: "Technology", demand: "High", growth: "High", careers: ["UI Designer", "UX Researcher", "Product Designer"] },
  "genai-professionals": { group: "Technology", demand: "High", growth: "High", careers: ["AI Specialist", "Innovation Lead", "Digital Strategist"] },
  "practical-accounting": { group: "Business & Finance", demand: "High", growth: "Growing", careers: ["Accountant", "Finance Executive", "Bookkeeper"] },
  "pwc-edge": { group: "Business & Finance", demand: "Medium", growth: "High", careers: ["Strategic Finance Analyst", "Corporate Finance Professional"] },
  "acca": { group: "Business & Finance", demand: "High", growth: "High", careers: ["Chartered Accountant", "Audit Associate", "Finance Manager"] },
  "cma-usa-course": { group: "Business & Finance", demand: "Medium", growth: "High", careers: ["Management Accountant", "Financial Controller", "CFO track roles"] },
  "enrolled-agent-course": { group: "Business & Finance", demand: "Medium", growth: "Growing", careers: ["US Tax Practitioner", "Tax Consultant", "Global Tax Advisor"] },
  "certified-tax-professional": { group: "Business & Finance", demand: "High", growth: "Growing", careers: ["Tax Consultant", "GST Practitioner", "Compliance Officer"] },
  "sap-fico": { group: "Business & Finance", demand: "High", growth: "Growing", careers: ["SAP Consultant", "FICO Analyst", "ERP Finance Specialist"] },
  "sap-mm": { group: "Business & Finance", demand: "Medium", growth: "Growing", careers: ["SAP MM Consultant", "Procurement Analyst", "Supply Chain Specialist"] },
  "sap-sd": { group: "Business & Finance", demand: "Medium", growth: "Growing", careers: ["SAP SD Consultant", "Sales Operations Analyst"] },
  "hr-management-course": { group: "Business & Finance", demand: "High", growth: "Growing", careers: ["HR Executive", "Recruitment Specialist", "People Operations"] },
  "quantity-surveying": { group: "Engineering", demand: "High", growth: "Growing", careers: ["Quantity Surveyor", "Cost Estimator", "Contracts Manager"] },
  "structural-design": { group: "Engineering", demand: "Medium", growth: "Growing", careers: ["Structural Engineer", "Design Engineer", "Civil Consultant"] },
  "bim-course": { group: "Engineering", demand: "High", growth: "High", careers: ["BIM Modeler", "Construction Planner", "Digital Project Coordinator"] },
  "mep-design": { group: "Engineering", demand: "High", growth: "Growing", careers: ["MEP Designer", "Building Services Engineer", "HVAC Designer"] },
  "digital-marketing": { group: "Marketing", demand: "High", growth: "High", careers: ["Digital Marketer", "SEO Specialist", "Social Media Manager"] },
  "performance-marketing": { group: "Marketing", demand: "High", growth: "High", careers: ["Performance Marketer", "Growth Specialist", "Paid Media Manager"] },
  "stock-market": { group: "Trading", demand: "Medium", growth: "Growing", careers: ["Equity Analyst", "Independent Trader", "Wealth Advisor"] },
  "forex-trading": { group: "Trading", demand: "Medium", growth: "Growing", careers: ["Forex Trader", "Currency Analyst", "Trading Consultant"] },
  "mutual-funds-course": { group: "Trading", demand: "Medium", growth: "Growing", careers: ["Mutual Fund Advisor", "Wealth Manager", "Investment Consultant"] },
  "personal-finance-course": { group: "Trading", demand: "Medium", growth: "Growing", careers: ["Financial Planner", "Personal Finance Coach"] },
  "hospital-administration": { group: "Healthcare", demand: "High", growth: "Growing", careers: ["Hospital Administrator", "Healthcare Operations Manager"] },
  "general-fitness-trainer": { group: "Fitness", demand: "High", growth: "Growing", careers: ["Gym Trainer", "Fitness Instructor", "Wellness Coach"] },
  "personal-fitness-trainer": { group: "Fitness", demand: "High", growth: "Growing", careers: ["Personal Trainer", "Fitness Coach", "Studio Instructor"] },
  "advanced-certified-personal-trainer": { group: "Fitness", demand: "Medium", growth: "Growing", careers: ["Senior Personal Trainer", "Specialist Coach", "Studio Owner"] },
  "yoga-teacher-training": { group: "Fitness", demand: "High", growth: "Growing", careers: ["Yoga Instructor", "Wellness Coach", "Studio Founder"] },
  "montessori-teacher-training": { group: "Education", demand: "Medium", growth: "Growing", careers: ["Montessori Teacher", "Preschool Educator", "Early Childhood Specialist"] },
  "fashion-designing-boutique": { group: "Creative", demand: "Medium", growth: "Growing", careers: ["Fashion Designer", "Boutique Owner", "Creative Entrepreneur"] },
  "advanced-beauty-wellness-cert": { group: "Creative", demand: "High", growth: "Growing", careers: ["Beauty Therapist", "Spa Specialist", "Salon Manager"] },
  "spoken-english": { group: "Language", demand: "High", growth: "High", careers: ["Better communication roles", "Customer-facing jobs", "Global opportunities"] },
  "german-language": { group: "Language", demand: "High", growth: "High", careers: ["Germany-ready professional", "Nurse/Engineer abroad", "Language specialist"] },
  "ielts-exam-coaching": { group: "Language", demand: "High", growth: "High", careers: ["Study abroad candidate", "Immigration-ready professional"] },
  "pte-coaching": { group: "Language", demand: "High", growth: "Growing", careers: ["Study abroad candidate", "Global mobility roles"] },
  "airport-management-course": { group: "Aviation", demand: "High", growth: "Growing", careers: ["Airport Executive", "Ground Staff Manager", "Aviation Operations"] },
  "kerala-psc": { group: "Government Exams", demand: "High", growth: "Medium", careers: ["Kerala Government Officer", "PSC-qualified roles"] },
  "kpsc-technical-exams": { group: "Government Exams", demand: "High", growth: "Medium", careers: ["Technical Government Officer", "Engineering cadre roles"] },
  "kpsc-teaching": { group: "Government Exams", demand: "High", growth: "Medium", careers: ["Government School Teacher", "Education Officer"] },
  "banking": { group: "Government Exams", demand: "High", growth: "Growing", careers: ["Bank PO", "Bank Clerk", "Financial Services Officer"] },
  "ssc": { group: "Government Exams", demand: "High", growth: "Medium", careers: ["Central Government Staff", "SSC-qualified roles"] },
  "rrb-railways": { group: "Government Exams", demand: "High", growth: "Medium", careers: ["Railway Officer", "Technical/Non-technical railway roles"] },
  "teaching-national": { group: "Government Exams", demand: "High", growth: "Growing", careers: ["School Teacher", "CTET-qualified educator"] },
  "other-exams": { group: "Government Exams", demand: "Medium", growth: "Medium", careers: ["Competitive exam aspirant", "Government job seeker"] },
};

const TIMELINE_MAP = {
  "Immediately (0–3 Months)": "Immediately (0–3 months)",
  "Within 6 Months": "Within 6 months",
  "Within 1 Year": "Within 1 year",
  "Just Exploring": "Just Exploring",
};

const enriched = Object.keys(SPEC_COURSES)
  .map((id) => {
    const course = source.find((c) => c.id === id);
    const meta = SPEC_COURSES[id];
    if (!course) return null;
    return {
      ...course,
      group: meta.group,
      careerOpportunities: meta.careers,
      demandIndicator: meta.demand,
      futureGrowthIndicator: meta.growth,
    };
  })
  .filter(Boolean);

fs.writeFileSync(
  path.join(root, "src", "data", "courses.json"),
  JSON.stringify(enriched, null, 2),
  "utf8"
);
console.log("Generated", enriched.length, "courses");
