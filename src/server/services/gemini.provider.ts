import "server-only";

import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

import {
  fixGrammarResultSchema,
  generationResultSchema,
  improveBulletResultSchema,
  type FixGrammarInput,
  type FixGrammarResult,
  type GenerateCvInput,
  type GenerationResult,
  type ImproveBulletInput,
  type ImproveBulletResult,
} from "@/lib/validations/ai";
import {
  createResumeId,
  emptyResumeDocument,
  parseResumeDocument,
  resumeDocumentSchema,
  type ResumeDocument,
} from "@/lib/validations/resume";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const TIMEOUT_MS = 45_000;
const MAX_INPUT_CHARS = 5_000;
const MAX_PARSE_CHARS = 20_000;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  client = new GoogleGenAI({ apiKey: key });
  return client;
}

function withTimeout<T>(promise: Promise<T>, ms = TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Gemini request timed out")),
      ms
    );
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

function cleanJsonResponse(text: string | undefined): string {
  if (!text) throw new Error("Empty response from Gemini");
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/** Build a concise resume snapshot for the prompt — only the fields needed. */
function resumeSnapshot(doc: ResumeDocument, sections: string[]): string {
  const parts: string[] = [];

  if (doc.personal.fullName) parts.push(`Name: ${doc.personal.fullName}`);
  if (doc.summary) parts.push(`Summary: ${doc.summary}`);

  if (doc.experience.length > 0) {
    parts.push("Experience:");
    for (const exp of doc.experience.slice(0, 10)) {
      const dates = [exp.startDate, exp.current ? "Present" : exp.endDate]
        .filter(Boolean)
        .join(" – ");
      parts.push(`  ${exp.role} at ${exp.company}${dates ? ` (${dates})` : ""}`);
      for (const b of exp.bullets.slice(0, 8)) {
        if (b.text.trim()) parts.push(`    • ${b.text}`);
      }
    }
  }

  if (doc.education.length > 0) {
    parts.push("Education:");
    for (const edu of doc.education.slice(0, 5)) {
      parts.push(`  ${edu.degree} ${edu.field} — ${edu.school}`);
    }
  }

  if (doc.skills.length > 0) {
    parts.push(`Skills: ${doc.skills.map((s) => s.name).join(", ")}`);
  }

  if (sections.includes("projectHighlights") && doc.projects.length > 0) {
    parts.push("Projects:");
    for (const proj of doc.projects.slice(0, 10)) {
      parts.push(`  [ID: ${proj.id}] ${proj.name}: ${proj.description}`);
      for (const b of proj.bullets.slice(0, 6)) {
        if (b.text.trim()) parts.push(`    • ${b.text}`);
      }
    }
  }

  if (sections.includes("languages") && doc.languages.length > 0) {
    parts.push("Languages:");
    for (const lang of doc.languages) {
      parts.push(`  [ID: ${lang.id}] ${lang.name} — ${lang.proficiency}`);
    }
  }

  return parts.join("\n").slice(0, MAX_INPUT_CHARS);
}

/* ── Generate CV suggestions ─────────────────────────────────────────── */

const GENERATE_SYSTEM = `You are an expert professional resume writing assistant.

Strict Rules:
- Preserve the user's actual experience and meaning.
- Never invent employers, degrees, certifications, metrics, skills, or achievements.
- Use concise, professional language.
- Only suggest skills that are already mentioned or clearly evidenced in the resume content.
- Never add languages or invent fluency levels.
- For projects and languages, ALWAYS preserve the exact ID provided in [ID: ...].
- Return ONLY valid JSON matching the requested structure.`;

function buildGeneratePrompt(input: GenerateCvInput): string {
  const snapshot = resumeSnapshot(input.document, input.sections);
  const requested = input.sections.join(", ");

  return `Target role: ${input.targetRole}
Requested sections: ${requested}

Resume content:
${snapshot}

Instructions:
1. Generate grounded suggestions for the requested sections (${requested}).
2. Only use facts present in the resume above. Do NOT invent new credentials, jobs, or skills.
${
  input.sections.includes("summary")
    ? '- "summary": { "original": "<current summary>", "suggested": "<professional summary tailored to the target role using only real facts>" }'
    : '- "summary": null'
}
${
  input.sections.includes("skills")
    ? '- "skills": [{ "name": "<skill name>", "reason": "<brief mention of where it appeared in experience/projects>" }] — only include skills already evidenced in the resume'
    : '- "skills": []'
}
${
  input.sections.includes("projectHighlights")
    ? '- "projectHighlights": [{ "projectId": "<exact project id>", "projectName": "<name>", "originalBullets": ["<current>"], "suggestedBullets": ["<concise action-oriented bullets>"] }]'
    : '- "projectHighlights": []'
}
${
  input.sections.includes("languages")
    ? '- "languages": [{ "languageId": "<exact language id>", "originalName": "<current>", "originalProficiency": "<current>", "suggestedName": "<standardized>", "suggestedProficiency": "<standardized>", "reason": "<reason>" }]'
    : '- "languages": []'
}
- "notes": ["<short, actionable hints or observations>"] (max 4)

Output JSON schema:
{
  "summary": null or { "original": string, "suggested": string },
  "skills": [{ "name": string, "reason": string }],
  "projectHighlights": [{ "projectId": string, "projectName": string, "originalBullets": [string], "suggestedBullets": [string] }],
  "languages": [{ "languageId": string, "originalName": string, "originalProficiency": string, "suggestedName": string, "suggestedProficiency": string, "reason": string }],
  "notes": [string]
}`;
}

export async function generateWithGemini(
  input: GenerateCvInput
): Promise<GenerationResult> {
  const ai = getClient();
  const prompt = buildGeneratePrompt(input);

  const response = (await withTimeout(
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: GENERATE_SYSTEM,
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    })
  )) as GenerateContentResponse;

  const rawJson = cleanJsonResponse(response.text);
  const parsed = JSON.parse(rawJson);
  return generationResultSchema.parse(parsed);
}

/* ── Improve bullet ──────────────────────────────────────────────────── */

const BULLET_SYSTEM = `You are a professional resume bullet writer.
Improve the user's single resume bullet point.

Strict Rules:
- Start with a strong action verb in the past tense (or present tense if currently working there).
- Focus on what changed, improved, or was delivered.
- NEVER invent numbers, percentages, dollar figures, or technologies not in the original text.
- If the original lacked metrics, keep it qualitative rather than guessing.
- Keep the improved bullet under 300 characters.
- Return ONLY valid JSON: { "improvedBullet": string, "explanation": string }`;

export async function improveBulletWithGemini(
  input: ImproveBulletInput
): Promise<ImproveBulletResult> {
  const ai = getClient();

  const prompt = `Context:
Role: ${input.role || "Professional"}
Employer: ${input.company || "Company"}

Original bullet:
"${input.bullet}"

Improve this bullet point to be more impactful and professional while keeping all facts honest.
Return JSON:
{
  "improvedBullet": "<improved version>",
  "explanation": "<one sentence explaining the improvement>"
}`;

  const response = (await withTimeout(
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: BULLET_SYSTEM,
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    })
  )) as GenerateContentResponse;

  const rawJson = cleanJsonResponse(response.text);
  const parsed = JSON.parse(rawJson);
  return improveBulletResultSchema.parse(parsed);
}

/* ── Fix grammar ─────────────────────────────────────────────────────── */

const GRAMMAR_SYSTEM = `You are a professional resume proofreader.
Fix grammar, spelling, punctuation, and phrasing clarity.

Strict Rules:
- Preserve the exact meaning, voice, and details.
- Never add new facts or claims.
- Return ONLY valid JSON: { "correctedText": string, "explanation": string }`;

export async function fixGrammarWithGemini(
  input: FixGrammarInput
): Promise<FixGrammarResult> {
  const ai = getClient();

  const prompt = `Text to proofread:
"${input.text}"

Fix grammar, spelling, and phrasing.
Return JSON:
{
  "correctedText": "<corrected text>",
  "explanation": "<brief summary of what was fixed>"
}`;

  const response = (await withTimeout(
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: GRAMMAR_SYSTEM,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    })
  )) as GenerateContentResponse;

  const rawJson = cleanJsonResponse(response.text);
  const parsed = JSON.parse(rawJson);
  return fixGrammarResultSchema.parse(parsed);
}

/* ── AI-enhanced CV import ───────────────────────────────────────────── */

const IMPORT_SYSTEM = `You are an expert resume parser. Extract structured information from CV/resume text into structured JSON.

Strict Rules:
- Only extract information explicitly mentioned in the text.
- Do NOT fabricate dates, companies, degrees, or skills.
- Map sections accurately to the schema.
- Every repeatable item must have an "id" field (generate a unique string like "exp_1", "edu_1", etc.).
- Return ONLY valid JSON matching the ResumeDocument schema.`;

export async function parseResumeWithGemini(
  text: string
): Promise<ResumeDocument> {
  const ai = getClient();

  const prompt = `Parse this resume text into a structured JSON ResumeDocument:

${text.slice(0, MAX_PARSE_CHARS)}

Return a JSON object matching this structure:
{
  "version": 1,
  "personal": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "website": string,
    "linkedin": string,
    "github": string
  },
  "summary": string,
  "experience": [
    {
      "id": string,
      "company": string,
      "role": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bullets": [{ "id": string, "text": string }]
    }
  ],
  "education": [
    {
      "id": string,
      "school": string,
      "degree": string,
      "field": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "details": string
    }
  ],
  "skills": [{ "id": string, "name": string }],
  "projects": [
    {
      "id": string,
      "name": string,
      "url": string,
      "description": string,
      "bullets": [{ "id": string, "text": string }]
    }
  ],
  "certifications": [
    {
      "id": string,
      "name": string,
      "issuer": string,
      "issueDate": string,
      "credentialUrl": string
    }
  ],
  "languages": [{ "id": string, "name": string, "proficiency": string }]
}`;

  const response = (await withTimeout(
    ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: IMPORT_SYSTEM,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
    40_000
  )) as GenerateContentResponse;

  const rawJson = cleanJsonResponse(response.text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return emptyResumeDocument();
  }

  return normalizeParsedResume(parsed);
}

function normalizeParsedResume(raw: unknown): ResumeDocument {
  if (!raw || typeof raw !== "object") return emptyResumeDocument();

  const record = raw as Record<string, unknown>;
  const p = (record.personal && typeof record.personal === "object"
    ? record.personal
    : {}) as Record<string, unknown>;

  const rawEmail = typeof p.email === "string" ? p.email.trim() : "";
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "";

  const personal = {
    fullName: typeof p.fullName === "string" ? p.fullName.trim().slice(0, 100) : "",
    roleApplied: typeof p.roleApplied === "string" ? p.roleApplied.trim().slice(0, 120) : "",
    email: validEmail,
    phone: typeof p.phone === "string" ? p.phone.trim().slice(0, 40) : "",
    location: typeof p.location === "string" ? p.location.trim().slice(0, 120) : "",
    website: typeof p.website === "string" ? p.website.trim().slice(0, 200) : "",
    linkedin: typeof p.linkedin === "string" ? p.linkedin.trim().slice(0, 200) : "",
    github: typeof p.github === "string" ? p.github.trim().slice(0, 200) : "",
    photoUrl: typeof p.photoUrl === "string" ? p.photoUrl.trim() : "",
  };

  const summary = typeof record.summary === "string" ? record.summary.trim().slice(0, 2000) : "";

  const rawExp = Array.isArray(record.experience) ? record.experience : [];
  const experience = rawExp.map((e: any) => {
    const rawBullets: unknown[] = Array.isArray(e.bullets) ? e.bullets : [];
    const bullets = rawBullets
      .map((b: any) => {
        if (typeof b === "string" && b.trim()) {
          return { id: createResumeId(), text: b.trim().slice(0, 500) };
        }
        if (b && typeof b === "object" && typeof b.text === "string" && b.text.trim()) {
          return {
            id: typeof b.id === "string" && b.id ? b.id : createResumeId(),
            text: b.text.trim().slice(0, 500),
          };
        }
        return null;
      })
      .filter((b: any): b is { id: string; text: string } => Boolean(b && b.text))
      .slice(0, 12);

    const isCurrent =
      e.current === true ||
      e.current === "true" ||
      (typeof e.endDate === "string" && /present|current|now/i.test(e.endDate));

    return {
      id: typeof e.id === "string" && e.id ? e.id : createResumeId(),
      company: typeof e.company === "string" ? e.company.trim().slice(0, 120) : "",
      role: typeof e.role === "string" ? e.role.trim().slice(0, 120) : "",
      location: typeof e.location === "string" ? e.location.trim().slice(0, 120) : "",
      startDate: typeof e.startDate === "string" ? e.startDate.trim().slice(0, 30) : "",
      endDate: typeof e.endDate === "string" ? e.endDate.trim().slice(0, 30) : "",
      current: isCurrent,
      bullets,
    };
  }).slice(0, 20);

  const rawSkills = Array.isArray(record.skills) ? record.skills : [];
  const skills = rawSkills
    .map((s: any) => {
      if (typeof s === "string" && s.trim()) {
        return { id: createResumeId(), name: s.trim().slice(0, 60) };
      }
      if (s && typeof s === "object" && typeof s.name === "string" && s.name.trim()) {
        return {
          id: typeof s.id === "string" && s.id ? s.id : createResumeId(),
          name: s.name.trim().slice(0, 60),
        };
      }
      return null;
    })
    .filter((s): s is { id: string; name: string } => Boolean(s && s.name))
    .slice(0, 50);

  const rawEdu = Array.isArray(record.education) ? record.education : [];
  const education = rawEdu.map((edu: any) => ({
    id: typeof edu.id === "string" && edu.id ? edu.id : createResumeId(),
    school: typeof edu.school === "string" ? edu.school.trim().slice(0, 160) : "",
    degree: typeof edu.degree === "string" ? edu.degree.trim().slice(0, 120) : "",
    field: typeof edu.field === "string" ? edu.field.trim().slice(0, 120) : "",
    location: typeof edu.location === "string" ? edu.location.trim().slice(0, 120) : "",
    startDate: typeof edu.startDate === "string" ? edu.startDate.trim().slice(0, 30) : "",
    endDate: typeof edu.endDate === "string" ? edu.endDate.trim().slice(0, 30) : "",
    details: typeof edu.details === "string" ? edu.details.trim().slice(0, 1000) : "",
  })).slice(0, 10);

  const rawProjects = Array.isArray(record.projects) ? record.projects : [];
  const projects = rawProjects.map((p: any) => {
    const rawBullets: unknown[] = Array.isArray(p.bullets) ? p.bullets : [];
    const bullets = rawBullets
      .map((b: any) => {
        if (typeof b === "string" && b.trim()) {
          return { id: createResumeId(), text: b.trim().slice(0, 500) };
        }
        if (b && typeof b === "object" && typeof b.text === "string" && b.text.trim()) {
          return {
            id: typeof b.id === "string" && b.id ? b.id : createResumeId(),
            text: b.text.trim().slice(0, 500),
          };
        }
        return null;
      })
      .filter((b: any): b is { id: string; text: string } => Boolean(b && b.text))
      .slice(0, 10);

    return {
      id: typeof p.id === "string" && p.id ? p.id : createResumeId(),
      name: typeof p.name === "string" ? p.name.trim().slice(0, 120) : "",
      url: typeof p.url === "string" ? p.url.trim().slice(0, 200) : "",
      description: typeof p.description === "string" ? p.description.trim().slice(0, 1000) : "",
      bullets,
    };
  }).slice(0, 20);

  const rawCerts = Array.isArray(record.certifications) ? record.certifications : [];
  const certifications = rawCerts.map((c: any) => ({
    id: typeof c.id === "string" && c.id ? c.id : createResumeId(),
    name: typeof c.name === "string" ? c.name.trim().slice(0, 160) : "",
    issuer: typeof c.issuer === "string" ? c.issuer.trim().slice(0, 160) : "",
    issueDate: typeof c.issueDate === "string" ? c.issueDate.trim().slice(0, 30) : "",
    credentialUrl: typeof c.credentialUrl === "string" ? c.credentialUrl.trim().slice(0, 200) : "",
  })).slice(0, 20);

  const rawLangs = Array.isArray(record.languages) ? record.languages : [];
  const languages = rawLangs.map((l: any) => ({
    id: typeof l.id === "string" && l.id ? l.id : createResumeId(),
    name: typeof l.name === "string" ? l.name.trim().slice(0, 60) : "",
    proficiency: typeof l.proficiency === "string" ? l.proficiency.trim().slice(0, 40) : "",
  })).slice(0, 15);

  const parsed = resumeDocumentSchema.safeParse({
    version: 1,
    personal,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
  });

  return parsed.success ? parsed.data : emptyResumeDocument();
}
