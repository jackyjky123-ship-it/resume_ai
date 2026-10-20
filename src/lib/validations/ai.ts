import { z } from "zod";

import { resumeDocumentSchema } from "./resume";

/**
 * Contracts for the fixed CV import / suggestion operations.
 *
 * These schemas are used on both sides of the server boundary: the client
 * validates request payloads before sending them, and the server validates
 * model-shaped output before it can reach the editor. There is deliberately no
 * free-form prompt endpoint.
 */

export const AI_MODES = ["mock", "gemini"] as const;
export const aiModeSchema = z.enum(AI_MODES);
export type AiMode = z.infer<typeof aiModeSchema>;

export const GENERATE_SECTIONS = [
  "summary",
  "skills",
  "projectHighlights",
  "languages",
] as const;
export const generateSectionSchema = z.enum(GENERATE_SECTIONS);
export type GenerateSection = z.infer<typeof generateSectionSchema>;

export const generateCvInputSchema = z.object({
  targetRole: z
    .string()
    .trim()
    .min(2, "Enter the role you are targeting")
    .max(100, "Keep the target role under 100 characters"),
  sections: z
    .array(generateSectionSchema)
    .min(1, "Choose at least one section")
    .max(GENERATE_SECTIONS.length),
  document: resumeDocumentSchema,
});
export type GenerateCvInput = z.infer<typeof generateCvInputSchema>;

const summarySuggestionSchema = z.object({
  original: z.string().max(2_000),
  suggested: z.string().trim().min(1).max(2_000),
});

const skillSuggestionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  reason: z.string().max(200).default(""),
});

const projectHighlightSuggestionSchema = z.object({
  projectId: z.string().min(1).max(64),
  projectName: z.string().max(120),
  originalBullets: z.array(z.string().max(500)).max(10).default([]),
  suggestedBullets: z.array(z.string().trim().min(1).max(500)).min(1).max(10),
});

const languageSuggestionSchema = z.object({
  languageId: z.string().min(1).max(64),
  originalName: z.string().max(60),
  originalProficiency: z.string().max(40),
  suggestedName: z.string().trim().min(1).max(60),
  suggestedProficiency: z.string().max(40),
  reason: z.string().max(200).default(""),
});

export const generationResultSchema = z.object({
  summary: summarySuggestionSchema.nullable().default(null),
  skills: z.array(skillSuggestionSchema).max(20).default([]),
  projectHighlights: z
    .array(projectHighlightSuggestionSchema)
    .max(20)
    .default([]),
  languages: z.array(languageSuggestionSchema).max(15).default([]),
  notes: z.array(z.string().trim().min(1).max(300)).max(8).default([]),
});
export type GenerationResult = z.infer<typeof generationResultSchema>;
export type SummarySuggestion = z.infer<typeof summarySuggestionSchema>;
export type SkillSuggestion = z.infer<typeof skillSuggestionSchema>;
export type ProjectHighlightSuggestion = z.infer<
  typeof projectHighlightSuggestionSchema
>;
export type LanguageSuggestion = z.infer<typeof languageSuggestionSchema>;

export type CvImportResult = {
  document: z.infer<typeof resumeDocumentSchema>;
  warnings: string[];
  mode: AiMode;
  source: {
    fileName: string;
    characters: number;
  };
};

export const improveBulletInputSchema = z.object({
  bullet: z.string().trim().min(3, "Select a bullet to improve").max(500),
  role: z.string().max(120).default(""),
  company: z.string().max(120).default(""),
});
export type ImproveBulletInput = z.infer<typeof improveBulletInputSchema>;

export const improveBulletResultSchema = z.object({
  improvedBullet: z.string().trim().min(1).max(500),
  explanation: z.string().max(300).default(""),
});
export type ImproveBulletResult = z.infer<typeof improveBulletResultSchema>;

export const fixGrammarInputSchema = z.object({
  text: z.string().trim().min(3, "Select text to fix").max(2_000),
});
export type FixGrammarInput = z.infer<typeof fixGrammarInputSchema>;

export const fixGrammarResultSchema = z.object({
  correctedText: z.string().trim().min(1).max(2_000),
  explanation: z.string().max(300).default(""),
});
export type FixGrammarResult = z.infer<typeof fixGrammarResultSchema>;
