import "server-only";

import { CV_IMPORT_MAX_TEXT } from "@/lib/cv-files";

export function sanitizeErrorMessage(message: string): string {
  // Redact potential Gemini or Google Cloud API keys (AIza...)
  return message.replace(/AIza[0-9A-Za-z-_]{20,}/g, "[REDACTED_API_KEY]");
}
import {
  generateMockSuggestions,
  parseResumeTextLocally,
} from "@/lib/mock-ai";
import {
  generationResultSchema,
  type AiMode,
  type CvImportResult,
  type FixGrammarInput,
  type FixGrammarResult,
  type GenerateCvInput,
  type GenerationResult,
  type ImproveBulletInput,
  type ImproveBulletResult,
} from "@/lib/validations/ai";
import { resumeDocumentSchema, type ResumeDocument } from "@/lib/validations/resume";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function documentCorpus(document: ResumeDocument) {
  return [
    document.summary,
    document.personal.fullName,
    ...document.experience.flatMap((entry) => [
      entry.role,
      entry.company,
      entry.location,
      ...entry.bullets.map((bullet) => bullet.text),
    ]),
    ...document.education.flatMap((entry) => [
      entry.school,
      entry.degree,
      entry.field,
      entry.details,
    ]),
    ...document.skills.map((entry) => entry.name),
    ...document.projects.flatMap((entry) => [
      entry.name,
      entry.description,
      ...entry.bullets.map((bullet) => bullet.text),
    ]),
    ...document.certifications.flatMap((entry) => [
      entry.name,
      entry.issuer,
    ]),
    ...document.languages.map((entry) => entry.name),
  ]
    .join("\n")
    .toLowerCase();
}

function isGroundedSkill(name: string, corpus: string) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(normalized)}([^a-z0-9]|$)`,
    "i"
  );
  return pattern.test(corpus);
}

/**
 * Enforce the no-invention rule on model-shaped output before it reaches the
 * editor. The UI also requires explicit acceptance, but a suggestion that was
 * never mentioned in the user's own content must not appear at all.
 */
function enforceGroundedResult(
  result: GenerationResult,
  input: GenerateCvInput
): GenerationResult {
  const requested = new Set(input.sections);
  const corpus = documentCorpus(input.document);

  const skills = requested.has("skills")
    ? result.skills.filter(
        (skill, index, all) =>
          isGroundedSkill(skill.name, corpus) &&
          all.findIndex(
            (candidate) =>
              candidate.name.trim().toLowerCase() ===
              skill.name.trim().toLowerCase()
          ) === index
      )
    : [];

  const projectsById = new Map(
    input.document.projects.map((project) => [project.id, project])
  );
  const projectHighlights = requested.has("projectHighlights")
    ? result.projectHighlights.flatMap((suggestion) => {
        const project = projectsById.get(suggestion.projectId);
        if (!project) return [];
        return [
          {
            ...suggestion,
            projectName: project.name.trim() || "Untitled project",
            originalBullets: project.bullets
              .map((bullet) => bullet.text.trim())
              .filter(Boolean),
          },
        ];
      })
    : [];

  const languagesById = new Map(
    input.document.languages.map((language) => [language.id, language])
  );
  const languages = requested.has("languages")
    ? result.languages.flatMap((suggestion) => {
        const language = languagesById.get(suggestion.languageId);
        if (!language) return [];
        return [
          {
            ...suggestion,
            originalName: language.name,
            originalProficiency: language.proficiency,
          },
        ];
      })
    : [];

  return generationResultSchema.parse({
    ...result,
    summary: requested.has("summary") ? result.summary : null,
    skills,
    projectHighlights,
    languages,
  });
}

export async function importCvText(
  text: string,
  sourceName: string,
  apiKey?: string
): Promise<CvImportResult> {
  const keyToUse = apiKey?.trim();
  const mode: AiMode = keyToUse ? "gemini" : "mock";
  const truncated = text.length > CV_IMPORT_MAX_TEXT;
  const processText = truncated ? text.slice(0, CV_IMPORT_MAX_TEXT) : text;

  let document: ResumeDocument;
  let warnings: string[] = [];

  if (keyToUse) {
    try {
      const { parseResumeWithGemini } = await import("./gemini.provider");
      document = await parseResumeWithGemini(processText, keyToUse);
      const hasContent =
        document.experience.length > 0 ||
        document.education.length > 0 ||
        document.skills.length > 0 ||
        document.summary.length > 0 ||
        document.personal.fullName.length > 0;
      if (!hasContent) {
        console.warn(
          "[ai-import] Gemini returned empty structure, falling back to local heuristics"
        );
        const local = parseResumeTextLocally(processText);
        document = resumeDocumentSchema.parse(local.document);
        warnings = [...local.warnings];
      }
    } catch (error) {
      console.warn(
        "[ai-import] Gemini parsing failed, falling back to local heuristics:",
        error instanceof Error ? error.message : "Unknown error"
      );
      const local = parseResumeTextLocally(processText);
      document = resumeDocumentSchema.parse(local.document);
      warnings = [...local.warnings, "AI parsing unavailable; used local parser."];
    }
  } else {
    const local = parseResumeTextLocally(processText);
    document = resumeDocumentSchema.parse(local.document);
    warnings = local.warnings;
  }

  if (truncated) {
    warnings.push(
      `Only the first ${CV_IMPORT_MAX_TEXT.toLocaleString()} characters were read.`
    );
  }

  return {
    document,
    warnings: warnings.slice(0, 4),
    mode,
    source: {
      fileName: sourceName,
      characters: Math.min(text.length, CV_IMPORT_MAX_TEXT),
    },
  };
}

export async function generateCvSuggestions(
  input: GenerateCvInput,
  apiKey?: string
): Promise<{
  result: GenerationResult;
  mode: AiMode;
}> {
  const keyToUse = apiKey?.trim() || input.apiKey?.trim();
  const mode: AiMode = keyToUse ? "gemini" : "mock";

  let result: GenerationResult;
  if (keyToUse) {
    const { generateWithGemini } = await import("./gemini.provider");
    const raw = await generateWithGemini(input, keyToUse);
    result = generationResultSchema.parse(raw);
  } else {
    const raw = generateMockSuggestions(input);
    result = generationResultSchema.parse(raw);
  }

  return {
    result: enforceGroundedResult(result, input),
    mode,
  };
}

export async function improveBullet(
  input: ImproveBulletInput,
  apiKey?: string
): Promise<ImproveBulletResult & { mode: AiMode }> {
  const keyToUse = apiKey?.trim() || input.apiKey?.trim();
  const mode: AiMode = keyToUse ? "gemini" : "mock";

  if (keyToUse) {
    const { improveBulletWithGemini } = await import("./gemini.provider");
    const result = await improveBulletWithGemini(input, keyToUse);
    return { ...result, mode };
  }

  // Deterministic local fallback
  const cleaned = input.bullet.trim();
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  const trailingPeriod = capitalized.endsWith(".") ? capitalized : `${capitalized}.`;
  return {
    improvedBullet: trailingPeriod,
    explanation: "Demo mode: polished capitalization and punctuation.",
    mode,
  };
}

export async function fixGrammar(
  input: FixGrammarInput,
  apiKey?: string
): Promise<FixGrammarResult & { mode: AiMode }> {
  const keyToUse = apiKey?.trim() || input.apiKey?.trim();
  const mode: AiMode = keyToUse ? "gemini" : "mock";

  if (keyToUse) {
    const { fixGrammarWithGemini } = await import("./gemini.provider");
    const result = await fixGrammarWithGemini(input, keyToUse);
    return { ...result, mode };
  }

  // Deterministic local fallback
  const cleaned = input.text.trim();
  return {
    correctedText: cleaned,
    explanation: "Demo mode: preserved text structure.",
    mode,
  };
}
