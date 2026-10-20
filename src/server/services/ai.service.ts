import "server-only";

import {
  CV_IMPORT_MAX_TEXT,
} from "@/lib/cv-files";
import {
  generateMockSuggestions,
  parseResumeTextLocally,
} from "@/lib/mock-ai";
import {
  generationResultSchema,
  type AiMode,
  type CvImportResult,
  type GenerateCvInput,
  type GenerationResult,
} from "@/lib/validations/ai";
import { resumeDocumentSchema, type ResumeDocument } from "@/lib/validations/resume";

/**
 * Provider boundary for every AI-backed CV operation.
 *
 * Only deterministic local logic is enabled today. Gemini remains disabled
 * until the provider is implemented and a server-only key is configured; this
 * prevents a missing key from breaking editing and keeps demo output honest.
 */
export function getAiMode(): AiMode {
  return "mock";
}

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

export function importCvText(
  text: string,
  sourceName: string
): CvImportResult {
  const truncated = text.length > CV_IMPORT_MAX_TEXT;
  const local = parseResumeTextLocally(
    truncated ? text.slice(0, CV_IMPORT_MAX_TEXT) : text
  );
  const document = resumeDocumentSchema.parse(local.document);
  const warnings = truncated
    ? [
        ...local.warnings,
        `Only the first ${CV_IMPORT_MAX_TEXT.toLocaleString()} characters were read.`,
      ].slice(0, 4)
    : local.warnings;

  return {
    document,
    warnings,
    mode: getAiMode(),
    source: {
      fileName: sourceName,
      characters: Math.min(text.length, CV_IMPORT_MAX_TEXT),
    },
  };
}

export function generateCvSuggestions(input: GenerateCvInput): {
  result: GenerationResult;
  mode: AiMode;
} {
  const result = generateMockSuggestions(input);
  const validated = generationResultSchema.parse(result);
  return {
    result: enforceGroundedResult(validated, input),
    mode: getAiMode(),
  };
}
