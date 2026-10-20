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
});

export const resumeTemplateSchema = z.enum(TEMPLATE_IDS);

export const createResumeInputSchema = z.object({
  title: z.string().trim().min(1, "Give your resume a title").max(80),
  templateId: resumeTemplateSchema,
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
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };
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
