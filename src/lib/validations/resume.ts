import { z } from "zod";

import { TEMPLATE_IDS } from "@/lib/resume-meta";

/**
 * ResumeDocument is the validated JSONB payload stored on `Resume.content`.
 *
 * Every repeatable entry carries a stable id so React keys, reordering, and
 * (later) AI suggestions can target one row without relying on array indexes.
 * Drafts are allowed to be incomplete: empty strings are valid, but shape,
 * lengths, and array sizes are always enforced on the server.
 */

const idSchema = z.string().min(1).max(64);
const shortText = z.string().max(120);
const mediumText = z.string().max(200);
const longText = z.string().max(2_000);
const bulletText = z.string().max(500);

const optionalEmail = z.union([z.literal(""), z.email("Enter a valid email address")]);

export const personalInfoSchema = z.object({
  fullName: z.string().max(100),
  roleApplied: z.string().max(120).default(""),
  email: optionalEmail,
  phone: z.string().max(40),
  location: z.string().max(120),
  website: mediumText,
  linkedin: mediumText,
  github: mediumText,
  telegram: mediumText.default(""),
  photoUrl: z.string().max(2_000_000).default(""),
  gender: z.string().max(40).optional().default(""),
  nationality: z.string().max(60).optional().default(""),
  dateOfBirth: z.string().max(60).optional().default(""),
  placeOfBirth: z.string().max(200).optional().default(""),
  strengths: z.string().max(500).optional().default(""),
});

export const experienceEntrySchema = z.object({
  id: idSchema,
  company: shortText,
  role: shortText,
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  current: z.boolean(),
  bullets: z
    .array(z.object({ id: idSchema, text: bulletText }))
    .max(12)
    .default([]),
});

export const educationEntrySchema = z.object({
  id: idSchema,
  school: z.string().max(160),
  degree: shortText,
  field: shortText,
  location: z.string().max(120),
  startDate: z.string().max(30),
  endDate: z.string().max(30),
  details: z.string().max(1_000).default(""),
});

export const skillEntrySchema = z.object({
  id: idSchema,
  name: z.string().max(60),
});

export const projectEntrySchema = z.object({
  id: idSchema,
  name: shortText,
  url: mediumText,
  description: z.string().max(1_000).default(""),
  bullets: z
    .array(z.object({ id: idSchema, text: bulletText }))
    .max(10)
    .default([]),
});

export const certificationEntrySchema = z.object({
  id: idSchema,
  name: z.string().max(160),
  issuer: z.string().max(160),
  issueDate: z.string().max(30),
  credentialUrl: mediumText,
});

export const languageEntrySchema = z.object({
  id: idSchema,
  name: z.string().max(60),
  proficiency: z.string().max(40),
});

export const referenceEntrySchema = z.object({
  id: idSchema,
  name: z.string().max(120),
  position: z.string().max(120).default(""),
  workplace: z.string().max(160).default(""),
  email: z.string().max(120).default(""),
  phone: z.string().max(40).default(""),
});

export const resumeDocumentSchema = z.object({
  version: z.literal(1).default(1),
  personal: personalInfoSchema,
  summary: longText.default(""),
  experience: z.array(experienceEntrySchema).max(20).default([]),
  education: z.array(educationEntrySchema).max(10).default([]),
  skills: z.array(skillEntrySchema).max(50).default([]),
  projects: z.array(projectEntrySchema).max(20).default([]),
  certifications: z.array(certificationEntrySchema).max(20).default([]),
  languages: z.array(languageEntrySchema).max(15).default([]),
  references: z.array(referenceEntrySchema).max(10).optional().default([]),
});

export const resumeTemplateSchema = z.enum(TEMPLATE_IDS);

export const STARTER_ROLES = [
  "barista",
  "retail",
  "software",
  "support",
  "intern",
] as const;
export type StarterRole = (typeof STARTER_ROLES)[number];

export const createResumeInputSchema = z.object({
  title: z.string().trim().min(1, "Give your resume a title").max(80),
  templateId: resumeTemplateSchema,
  starterRole: z.enum(STARTER_ROLES).optional(),
});

export const updateResumeInputSchema = createResumeInputSchema.extend({
  content: resumeDocumentSchema,
});

/** RHF form model: the metadata and content saved by the editor together. */
export const resumeEditorSchema = z.object({
  title: z.string().trim().min(1, "Give your resume a title").max(80),
  templateId: resumeTemplateSchema,
  content: resumeDocumentSchema,
});

export const saveResumeInputSchema = updateResumeInputSchema.extend({
  resumeId: z.string().min(1).max(64),
});

export const renameResumeInputSchema = z.object({
  resumeId: z.string().min(1).max(64),
  title: z.string().trim().min(1, "Give your resume a title").max(80),
});

export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type ResumeEditorFormValues = z.infer<typeof resumeEditorSchema>;
export type SaveResumeInput = z.infer<typeof saveResumeInputSchema>;
export type CreateResumeInput = z.infer<typeof createResumeInputSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type SkillEntry = z.infer<typeof skillEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;
export type ResumeBullet = { id: string; text: string };

/**
 * Stable ID generator shared by entry factories, imports, and AI suggestions.
 * `crypto.randomUUID` exists in browsers and Node; the fallback keeps tests and
 * unusual runtimes working.
 */
export function createResumeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const newId = createResumeId;

export function emptyResumeDocument(): ResumeDocument {
  return {
    version: 1,
    personal: {
      fullName: "",
      roleApplied: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      telegram: "",
      photoUrl: "",
      gender: "",
      nationality: "",
      dateOfBirth: "",
      placeOfBirth: "",
      strengths: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
  };
}

/** Pre-populates clean starter drafts for students and first-time applicants. */
export function generateStarterResumeDocument(role: StarterRole): ResumeDocument {
  const doc = emptyResumeDocument();
  if (role === "barista") {
    doc.personal.roleApplied = "Barista & Café Specialist";
    doc.summary = "Energetic, customer-focused barista with a strong passion for craft coffee, latte art, and fast-paced counter operations. Dedicated to delivering friendly, memorable customer experiences while maintaining cleanliness and register accuracy.";
    doc.skills = [
      { id: newId(), name: "Espresso Extraction & Grinder Dial-in" },
      { id: newId(), name: "Milk Steaming & Latte Art" },
      { id: newId(), name: "POS Operations & Cash Handling" },
      { id: newId(), name: "Food Safety & Cleanliness Standards" },
      { id: newId(), name: "Customer Relations & Queue Management" },
      { id: newId(), name: "Inventory Restocking & Merchandising" },
    ];
    doc.experience = [
      {
        id: newId(),
        company: "Artisan Coffee House",
        role: "Barista",
        location: "City Center",
        startDate: "2023",
        endDate: "Present",
        current: true,
        bullets: [
          { id: newId(), text: "Handcrafted 150+ specialty coffee, espresso, and cold brew orders daily with consistent quality and presentation." },
          { id: newId(), text: "Operated POS terminal, handled cash transactions with 100% register accuracy, and fulfilled online mobile orders." },
          { id: newId(), text: "Maintained rigorous hygiene and food safety protocols, performing daily espresso machine backflushing and station sanitization." },
        ],
      },
    ];
    doc.education = [
      {
        id: newId(),
        school: "City Community College",
        degree: "Associate Degree / General Studies",
        field: "Hospitality & Business",
        location: "City, State",
        startDate: "2022",
        endDate: "2024",
        details: "Coursework in Customer Service Communication and Business Basics.",
      },
    ];
  } else if (role === "retail") {
    doc.personal.roleApplied = "Retail Sales Associate";
    doc.summary = "Proactive and customer-oriented Retail Associate with experience in merchandise displays, cashier operations, and personalized product recommendations. Committed to boosting store sales through engaging customer service.";
    doc.skills = [
      { id: newId(), name: "Customer Assistance & Sales" },
      { id: newId(), name: "Point of Sale (POS) & Checkout" },
      { id: newId(), name: "Visual Merchandising & Floor Sets" },
      { id: newId(), name: "Inventory Audits & Stockroom Organization" },
      { id: newId(), name: "Loss Prevention Awareness" },
      { id: newId(), name: "Product Knowledge & Upselling" },
    ];
    doc.experience = [
      {
        id: newId(),
        company: "Urban Retail Outfitters",
        role: "Sales Associate",
        location: "Metro Mall",
        startDate: "2023",
        endDate: "Present",
        current: true,
        bullets: [
          { id: newId(), text: "Greeted customers promptly, assessed individual preferences, and provided knowledgeable styling recommendations." },
          { id: newId(), text: "Managed checkout operations, processed returns and exchanges smoothly, and achieved 98% positive customer satisfaction ratings." },
          { id: newId(), text: "Organized display tables and floor inventory according to visual merchandising guidelines to drive foot traffic." },
        ],
      },
    ];
  } else if (role === "software") {
    doc.personal.roleApplied = "Junior Software Engineer / CS Student";
    doc.summary = "Computer Science student with practical experience building modern full-stack web applications. Skilled in TypeScript, React, Next.js, and SQL, with a passion for clean architecture, accessible UI, and collaborative Git workflows.";
    doc.skills = [
      { id: newId(), name: "TypeScript & JavaScript (ES6+)" },
      { id: newId(), name: "React, Next.js & Tailwind CSS" },
      { id: newId(), name: "Node.js, PostgreSQL & Prisma" },
      { id: newId(), name: "Git, GitHub & CI/CD Actions" },
      { id: newId(), name: "RESTful APIs & GraphQL" },
      { id: newId(), name: "Data Structures & Algorithms" },
    ];
    doc.projects = [
      {
        id: newId(),
        name: "Full-Stack Web Platform",
        url: "https://github.com/my-profile/project",
        description: "Modern web application with relational database persistence, responsive UI, and secure authentication.",
        bullets: [
          { id: newId(), text: "Engineered responsive full-stack application using Next.js 16 App Router and serverless PostgreSQL." },
          { id: newId(), text: "Implemented secure user authentication, optimistic UI updates, and automated GitHub Actions test pipelines." },
        ],
      },
    ];
    doc.education = [
      {
        id: newId(),
        school: "State University",
        degree: "B.S. in Computer Science",
        field: "Software Engineering",
        location: "Campus",
        startDate: "2022",
        endDate: "2026",
        details: "Relevant Coursework: Data Structures, Web Engineering, Database Systems, Computer Networks.",
      },
    ];
  } else if (role === "support") {
    doc.personal.roleApplied = "Customer Support Specialist";
    doc.summary = "Empathetic, quick-thinking Support Specialist skilled in omnichannel customer communication, ticket resolution, and active listening. Focused on turning challenging support inquiries into positive brand experiences.";
    doc.skills = [
      { id: newId(), name: "Omnichannel Support (Email, Chat, Phone)" },
      { id: newId(), name: "Zendesk, Intercom & CRM Tools" },
      { id: newId(), name: "Conflict De-escalation & Empathy" },
      { id: newId(), name: "Technical Troubleshooting" },
      { id: newId(), name: "Knowledge Base Article Writing" },
    ];
    doc.experience = [
      {
        id: newId(),
        company: "Digital Services Co.",
        role: "Customer Support Representative",
        location: "Remote",
        startDate: "2023",
        endDate: "Present",
        current: true,
        bullets: [
          { id: newId(), text: "Resolved 60+ customer tickets daily via chat and email with 95%+ first-contact resolution rate." },
          { id: newId(), text: "Authored 10+ FAQ and troubleshooting articles in internal knowledge base, reducing repeat customer inquiries." },
        ],
      },
    ];
  } else if (role === "intern") {
    doc.personal.roleApplied = "Campus / Academic Intern";
    doc.summary = "Dedicated university student with strong analytical, writing, and collaborative research capabilities. Fast learner seeking an internship opportunity to apply academic training to real-world business challenges.";
    doc.skills = [
      { id: newId(), name: "Research & Data Synthesis" },
      { id: newId(), name: "Written & Verbal Communication" },
      { id: newId(), name: "Microsoft Office & Google Workspace" },
      { id: newId(), name: "Project Coordination & Deadlines" },
      { id: newId(), name: "Team Presentation Skills" },
    ];
    doc.education = [
      {
        id: newId(),
        school: "University",
        degree: "Bachelor of Arts / Science",
        field: "Major Subject",
        location: "City, State",
        startDate: "2023",
        endDate: "2027",
        details: "Dean's Honor List • Active member of student society and project teams.",
      },
    ];
  }
  return doc;
}

export function newExperienceEntry(): ExperienceEntry {
  return {
    id: newId(),
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [{ id: newId(), text: "" }],
  };
}

export function newEducationEntry(): EducationEntry {
  return {
    id: newId(),
    school: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    details: "",
  };
}

export function newSkillEntry(): SkillEntry {
  return { id: newId(), name: "" };
}

export function newProjectEntry(): ProjectEntry {
  return {
    id: newId(),
    name: "",
    url: "",
    description: "",
    bullets: [],
  };
}

export function newCertificationEntry(): CertificationEntry {
  return {
    id: newId(),
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  };
}

export function newLanguageEntry(): LanguageEntry {
  return { id: newId(), name: "", proficiency: "" };
}

export function newReferenceEntry(): ReferenceEntry {
  return {
    id: newId(),
    name: "",
    position: "",
    workplace: "",
    email: "",
    phone: "",
  };
}

export function newBullet(): ResumeBullet {
  return { id: newId(), text: "" };
}

/** Parse stored JSONB defensively; unreadable content becomes a blank draft. */
export function parseResumeDocument(value: unknown): ResumeDocument {
  const parsed = resumeDocumentSchema.safeParse(value);
  return parsed.success ? parsed.data : emptyResumeDocument();
}

export function parseResumeDocumentResult(value: unknown) {
  return resumeDocumentSchema.safeParse(value);
}
