import {
  createResumeId,
  emptyResumeDocument,
  resumeDocumentSchema,
  type ExperienceEntry,
  type ResumeDocument,
} from "@/lib/validations/resume";
import type {
  GenerateSection,
  GenerationResult,
  LanguageSuggestion,
  ProjectHighlightSuggestion,
  SkillSuggestion,
} from "@/lib/validations/ai";

/**
 * Deterministic, local stand-ins for the future Gemini operations.
 *
 * The import parser uses conservative section heuristics so the feature is
 * useful before an AI key exists. Generation is intentionally grounded: it
 * only reformats or surfaces facts already present in the resume. Neither
 * function makes a network request.
 */

type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  summary: ["summary", "professional summary", "profile", "about", "objective"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "employment",
    "work history",
  ],
  education: ["education", "academic background", "academics"],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "competencies",
    "expertise",
  ],
  projects: ["projects", "selected projects", "personal projects", "portfolio"],
  certifications: ["certifications", "certificates", "licenses", "credentials"],
  languages: ["languages", "language skills"],
};

const HEADING_LOOKUP = new Map<string, SectionKey>();
for (const [key, aliases] of Object.entries(SECTION_ALIASES) as [
  SectionKey,
  string[],
][]) {
  for (const alias of aliases) HEADING_LOOKUP.set(alias, key);
}

const MONTH =
  "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\.?";
const DATE_PART = `(?:${MONTH}\\s+\\d{4}|\\d{1,2}\\/\\d{4}|(?:19|20)\\d{2})`;
const DATE_RANGE_RE = new RegExp(
  `(${DATE_PART})\\s*(?:-|–|—|to|until)\\s*(present|current|${DATE_PART})`,
  "i"
);
const SINGLE_DATE_RE = new RegExp(`(${DATE_PART})`, "i");
const URL_RE =
  /(?:https?:\/\/|www\.)[^\s<>"')]+|[a-z0-9-]+(?:\.[a-z0-9-]+)+\/[^\s<>"')]+/gi;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/i;

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max).trimEnd() : value;
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanHeading(line: string) {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectSection(line: string): SectionKey | null {
  if (line.length > 50 || /^[•·▪◦*-]/.test(line)) return null;
  const cleaned = cleanHeading(line);
  if (!cleaned || cleaned.length > 40) return null;
  return HEADING_LOOKUP.get(cleaned) ?? null;
}

function stripBullet(line: string) {
  return line.replace(/^[\s•·▪◦*\-–—]+/, "").trim();
}

function uniqueStrings(values: string[], max = Infinity) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(trimmed);
    if (output.length >= max) break;
  }
  return output;
}

function findUrls(text: string) {
  return uniqueStrings(
    (text.match(URL_RE) ?? []).map((url) => url.replace(/[.,;|]+$/, "")),
    20
  );
}

function findEmail(text: string) {
  return text.match(EMAIL_RE)?.[0]?.trim() ?? "";
}

function findPhone(text: string) {
  for (const line of text.split("\n")) {
    const withoutContactTargets = line
      .replace(EMAIL_RE, " ")
      .replace(URL_RE, " ");
    const match = withoutContactTargets.match(
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{3,4}/
    );
    if (!match) continue;
    const digits = match[0].replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      return clip(match[0].trim(), 40);
    }
  }
  return "";
}

function parseHeader(lines: string[], fullText: string) {
  const headerText = lines.join("\n");
  const urls = findUrls(headerText);
  const email = findEmail(fullText);
  const phone = findPhone(headerText);

  const linkedin =
    urls.find((url) => /linkedin\.com/i.test(url)) ?? "";
  const github = urls.find((url) => /github\.com/i.test(url)) ?? "";
  const telegram =
    urls.find((url) => /(?:t\.me|telegram\.(?:me|org))/i.test(url)) ?? "";
  const website =
    urls.find(
      (url) =>
        !/linkedin\.com/i.test(url) &&
        !/github\.com/i.test(url) &&
        !/(?:t\.me|telegram\.(?:me|org))/i.test(url) &&
        !EMAIL_RE.test(url)
    ) ?? "";

  const locationCandidate = lines.find(
    (line) =>
      !EMAIL_RE.test(line) &&
      !/https?:\/\/|www\./i.test(line) &&
      !/\d{3,}/.test(line) &&
      /^[A-Za-zÀ-ÿ .'-]+,\s*[A-Za-zÀ-ÿ .'-]+$/.test(line)
  );

  const nameCandidate = lines.find((line) => {
    if (!line || line.length > 60) return false;
    if (EMAIL_RE.test(line) || /https?:\/\/|www\./i.test(line)) return false;
    if (/\d{3,}/.test(line)) return false;
    if (/^(resume|curriculum vitae|cv)$/i.test(line)) return false;
    if (line === locationCandidate) return false;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 5) return false;
    return words.every((word) => /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.'-]*$/.test(word));
  });

  return {
    fullName: clip(nameCandidate ?? "", 100),
    roleApplied: "",
    email: clip(email, 200),
    phone,
    location: clip(locationCandidate ?? "", 120),
    website: clip(website, 200),
    linkedin: clip(linkedin, 200),
    github: clip(github, 200),
    telegram: clip(telegram, 200),
    photoUrl: "",
    gender: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    strengths: "",
  };
}

function splitSections(lines: string[]) {
  const sections: Partial<Record<SectionKey, string[]>> = {};
  const header: string[] = [];
  let active: SectionKey | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = detectSection(line);
    if (heading) {
      active = heading;
      if (!sections[heading]) sections[heading] = [];
      continue;
    }
    if (active) sections[active]?.push(line);
    else header.push(line);
  }

  return { header, sections };
}

function sectionLines(
  sections: Partial<Record<SectionKey, string[]>>,
  key: SectionKey
) {
  const lines = (sections[key] ?? []).map((line) => line.trim());
  while (lines[0] === "") lines.shift();
  while (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function toBlocks(lines: string[]) {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    current.push(trimmed);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function extractDateRange(text: string) {
  const match = text.match(DATE_RANGE_RE);
  if (!match) return null;
  const end = match[2]?.trim() ?? "";
  const current = /^(present|current)$/i.test(end);
  return {
    startDate: clip(match[1]?.trim() ?? "", 30),
    endDate: current ? "" : clip(end, 30),
    current,
    matched: match[0],
  };
}

function parseExperience(lines: string[]): ExperienceEntry[] {
  const blocks = toBlocks(lines);
  const entries: ExperienceEntry[] = [];

  for (const block of blocks.slice(0, 20)) {
    const headerLine =
      block.find(
        (line) => !extractDateRange(line) && !/^[•·▪◦*\-–—]/.test(line)
      ) ?? block[0];
    if (!headerLine) continue;

    const range = extractDateRange(block.join("\n"));
    const headerWithoutDate = range
      ? headerLine.replace(range.matched, "").trim()
      : headerLine;
    const cleanedHeader = stripBullet(headerWithoutDate)
      .replace(/[|•·\s]+$/, "")
      .trim();

    let role = "";
    let company = "";
    let location = "";

    const atMatch = cleanedHeader.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
    if (atMatch) {
      role = atMatch[1]?.trim() ?? "";
      company = atMatch[2]?.split(/\s*[|•·]\s*/)[0]?.trim() ?? "";
    } else {
      const parts = cleanedHeader
        .split(/\s*[|•·]\s*|\s+[—–]\s+|\s+-\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      role = parts[0] ?? "";
      company = parts[1] ?? "";
      location = parts[2] ?? "";
    }

    role = clip(role, 120);
    company = clip(company, 120);
    location = clip(location, 120);

    if (!role && !company) continue;

    const headerIndex = block.indexOf(headerLine);
    const bullets = uniqueStrings(
      block
        .slice(headerIndex + 1)
        .map(stripBullet)
        .filter((line) => line && !extractDateRange(line))
        .map((line) => clip(line, 500)),
      12
    );

    entries.push({
      id: createResumeId(),
      company,
      role,
      location,
      startDate: range?.startDate ?? "",
      endDate: range?.endDate ?? "",
      current: range?.current ?? false,
      bullets: bullets.map((text) => ({ id: createResumeId(), text })),
    });
  }

  return entries;
}

const SCHOOL_RE = /\b(university|college|institute|school|academy|polytechnic)\b/i;
const DEGREE_RE =
  /\b(bachelor|master|doctor|phd|ph\.d|bsc|b\.sc|msc|m\.sc|ba|b\.a|ma|m\.a|associate|diploma|certificate|degree)\b/i;

function parseEducation(lines: string[]) {
  const blocks = toBlocks(lines);
  const entries: ReturnType<typeof emptyResumeDocument>["education"] = [];

  for (const block of blocks.slice(0, 10)) {
    if (block.length === 0) continue;
    const joined = block.join("\n");
    const range = extractDateRange(joined);
    const withoutDates = block.map((line) => {
      if (!range) return line;
      return line.replace(range.matched, "").trim();
    });

    const school =
      withoutDates.find((line) => SCHOOL_RE.test(line)) ??
      withoutDates[0] ??
      "";
    const degreeLine =
      withoutDates.find(
        (line) => line !== school && DEGREE_RE.test(line)
      ) ?? "";
    const degreeMatch = degreeLine.match(/^(.*?)\b(?:in|of)\s+(.+)$/i);
    const degree = clip(
      degreeMatch?.[1]?.trim() || degreeLine.trim(),
      120
    );
    const field = clip(degreeMatch?.[2]?.trim() ?? "", 120);

    const details = withoutDates
      .filter((line) => line !== school && line !== degreeLine && line.trim())
      .join("\n");

    if (!school && !degree) continue;

    entries.push({
      id: createResumeId(),
      school: clip(school, 160),
      degree,
      field,
      location: "",
      startDate: range?.startDate ?? "",
      endDate: range?.endDate ?? "",
      details: clip(details, 1_000),
    });
  }

  return entries;
}

function parseSkills(lines: string[]) {
  const tokens = lines
    .flatMap((line) => line.replace(/^[^:]{1,30}:\s*/, "").split(/[,;|•·\n]+/))
    .map((token) => clip(token.trim(), 60))
    .filter(Boolean);
  return uniqueStrings(tokens, 50).map((name) => ({
    id: createResumeId(),
    name,
  }));
}

function parseProjects(lines: string[]) {
  const blocks = toBlocks(lines);
  const entries: ReturnType<typeof emptyResumeDocument>["projects"] = [];

  for (const block of blocks.slice(0, 20)) {
    const first = block.find((line) => line.trim());
    if (!first) continue;

    const urls = findUrls(block.join("\n"));
    const header = stripBullet(first).replace(/^project\s*[:\-]\s*/i, "");
    const headerParts = header
      .split(/\s*[|•·]\s*|\s+[—–]\s+|\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const name = clip(headerParts[0] ?? "", 120);
    if (!name) continue;

    const rest = block.slice(block.indexOf(first) + 1);
    const bulletLines = rest
      .filter((line) => /^[•·▪◦*\-–—]/.test(line))
      .map((line) => clip(stripBullet(line), 500));
    const descriptionLines = rest
      .filter((line) => !/^[•·▪◦*\-–—]/.test(line))
      .filter((line) => !urls.includes(line.replace(/[.,;|]+$/, "")));

    const subtitle = headerParts
      .slice(1)
      .filter(
        (part) =>
          !urls.includes(part.replace(/[.,;|]+$/, "")) &&
          !extractDateRange(part)
      )
      .join(" — ");
    const detailText = descriptionLines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ");
    const description = clip(
      [subtitle, detailText].filter(Boolean).join(" — "),
      1_000
    );

    entries.push({
      id: createResumeId(),
      name,
      url: clip(
        urls.find((url) => url.includes("/")) ?? urls[0] ?? "",
        200
      ),
      description,
      bullets: uniqueStrings(bulletLines, 10).map((text) => ({
        id: createResumeId(),
        text,
      })),
    });
  }

  return entries;
}

function parseCertifications(lines: string[]) {
  const entries: ReturnType<typeof emptyResumeDocument>["certifications"] = [];

  for (const line of lines.slice(0, 20)) {
    const cleaned = stripBullet(line);
    if (!cleaned) continue;
    const urls = findUrls(cleaned);
    const date = cleaned.match(SINGLE_DATE_RE)?.[0] ?? "";
    const withoutDate = date ? cleaned.replace(date, "").trim() : cleaned;
    const parts = withoutDate
      .split(/\s*[|•·]\s*|\s+[—–]\s+|\s+-\s+|,\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const name = clip(parts[0] ?? cleaned, 160);
    if (!name) continue;
    entries.push({
      id: createResumeId(),
      name,
      issuer: clip(parts[1] ?? "", 160),
      issueDate: clip(date, 30),
      credentialUrl: clip(urls[0] ?? "", 200),
    });
  }

  return entries;
}

function normalizeLanguageName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .replace(/\b[a-z]/g, (character) => character.toUpperCase());
  }
  return trimmed;
}

function normalizeProficiency(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[abc][12]$/i.test(trimmed)) return trimmed.toUpperCase();
  if (trimmed === trimmed.toLowerCase() || trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .replace(/\b[a-z]/g, (character) => character.toUpperCase());
  }
  return trimmed;
}

function parseLanguages(lines: string[]) {
  const entries: ReturnType<typeof emptyResumeDocument>["languages"] = [];

  for (const rawLine of lines.slice(0, 15)) {
    const line = stripBullet(rawLine).replace(/^languages?\s*[:\-]\s*/i, "");
    if (!line) continue;

    let name = "";
    let proficiency = "";
    const parenthesized = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (parenthesized) {
      name = parenthesized[1] ?? "";
      proficiency = parenthesized[2] ?? "";
    } else {
      const parts = line
        .split(/\s*[|•·]\s*|\s+[—–]\s+|\s+-\s+|:\s+|,\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      name = parts[0] ?? "";
      proficiency = parts.slice(1).join(", ");
    }

    name = clip(normalizeLanguageName(name), 60);
    proficiency = clip(normalizeProficiency(proficiency), 40);
    if (!name && !proficiency) continue;

    const duplicate = entries.some(
      (entry) => entry.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) continue;

    entries.push({ id: createResumeId(), name, proficiency });
  }

  return entries;
}

export type LocalImportResult = {
  document: ResumeDocument;
  warnings: string[];
};

/**
 * Turn extracted CV text into a valid ResumeDocument. This is deliberately
 * conservative: anything the heuristics cannot identify is left blank and
 * surfaced as a warning, never fabricated.
 */
export function parseResumeTextLocally(text: string): LocalImportResult {
  const normalized = normalizeText(text);
  if (!normalized) {
    return {
      document: emptyResumeDocument(),
      warnings: ["We couldn't find any text in that file."],
    };
  }

  const lines = normalized.split("\n");
  const { header, sections } = splitSections(lines);
  const document = emptyResumeDocument();
  document.personal = parseHeader(header, normalized);

  const summaryLines = sectionLines(sections, "summary");
  document.summary = clip(
    uniqueStrings(summaryLines.map(stripBullet), 8).join(" "),
    2_000
  );
  document.experience = parseExperience(sectionLines(sections, "experience"));
  document.education = parseEducation(sectionLines(sections, "education"));
  document.skills = parseSkills(sectionLines(sections, "skills"));
  document.projects = parseProjects(sectionLines(sections, "projects"));
  document.certifications = parseCertifications(
    sectionLines(sections, "certifications")
  );
  document.languages = parseLanguages(sectionLines(sections, "languages"));

  const warnings: string[] = [];
  const hasSections = Object.keys(sections).length > 0;

  if (!hasSections) {
    const fallback = header
      .filter((line) => {
        if (!line) return false;
        if (EMAIL_RE.test(line) || /https?:\/\/|www\./i.test(line)) return false;
        if (/\d{3,}/.test(line)) return false;
        return line !== document.personal.fullName;
      })
      .join(" ");
    document.summary = clip(fallback || normalized, 2_000);
    warnings.push(
      "We couldn't detect separate sections, so the text was placed in your summary. Split it into sections before applying."
    );
  }

  if (!document.personal.email && !document.personal.phone) {
    warnings.push("We couldn't find contact details. Add them manually.");
  }

  if (
    sectionLines(sections, "experience").length > 0 &&
    document.experience.length === 0
  ) {
    warnings.push(
      "The experience section was found, but no roles were detected. Review the imported summary and add them manually."
    );
  }

  if (
    sectionLines(sections, "skills").length > 0 &&
    document.skills.length === 0
  ) {
    warnings.push("The skills section was found, but no skills were detected.");
  }

  const validated = resumeDocumentSchema.safeParse(document);
  if (!validated.success) {
    return {
      document: emptyResumeDocument(),
      warnings: [
        "That CV had an unusual structure we couldn't map safely. Try pasting the text or fill the editor manually.",
      ],
    };
  }

  return { document: validated.data, warnings: warnings.slice(0, 4) };
}

/* -------------------------------------------------------------------------- */
/* Grounded demo suggestions                                                   */
/* -------------------------------------------------------------------------- */

type SkillDefinition = {
  name: string;
  aliases: string[];
};

const SKILL_LIBRARY: SkillDefinition[] = [
  { name: "JavaScript", aliases: ["javascript"] },
  { name: "TypeScript", aliases: ["typescript"] },
  { name: "React", aliases: ["react", "react.js"] },
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
  { name: "Node.js", aliases: ["node.js", "nodejs", "node"] },
  { name: "Express", aliases: ["express.js", "express"] },
  { name: "Python", aliases: ["python"] },
  { name: "Django", aliases: ["django"] },
  { name: "Flask", aliases: ["flask"] },
  { name: "Java", aliases: ["java"] },
  { name: "Spring Boot", aliases: ["spring boot", "spring"] },
  { name: "C#", aliases: ["c#", "c sharp"] },
  { name: ".NET", aliases: [".net", "dotnet", "asp.net"] },
  { name: "SQL", aliases: ["sql"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MySQL", aliases: ["mysql"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "REST APIs", aliases: ["rest api", "rest apis", "restful"] },
  { name: "HTML", aliases: ["html", "html5"] },
  { name: "CSS", aliases: ["css", "css3"] },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwind css"] },
  { name: "Git", aliases: ["git"] },
  { name: "GitHub", aliases: ["github"] },
  { name: "Docker", aliases: ["docker"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "Azure", aliases: ["azure"] },
  { name: "Google Cloud", aliases: ["google cloud", "gcp"] },
  { name: "CI/CD", aliases: ["ci/cd", "continuous integration", "continuous delivery"] },
  { name: "Jest", aliases: ["jest"] },
  { name: "Playwright", aliases: ["playwright"] },
  { name: "Cypress", aliases: ["cypress"] },
  { name: "Figma", aliases: ["figma"] },
  { name: "Agile", aliases: ["agile"] },
  { name: "Scrum", aliases: ["scrum"] },
  { name: "Accessibility", aliases: ["accessibility", "a11y", "wcag"] },
  { name: "Performance", aliases: ["performance", "optimization", "optimisation"] },
  { name: "Testing", aliases: ["unit testing", "testing", "test automation"] },
  { name: "Project management", aliases: ["project management"] },
  { name: "Leadership", aliases: ["leadership", "led a team", "team lead"] },
  { name: "Communication", aliases: ["communication", "stakeholder"] },
  { name: "Problem solving", aliases: ["problem solving", "problem-solving"] },
  { name: "Data analysis", aliases: ["data analysis", "analytics"] },
  { name: "Machine learning", aliases: ["machine learning", "ml"] },
  { name: "UI/UX", aliases: ["ui/ux", "user experience", "user interface"] },
  { name: "Responsive design", aliases: ["responsive design", "responsive"] },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsAlias(text: string, alias: string) {
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(alias.toLowerCase())}([^a-z0-9]|$)`,
    "i"
  );
  return pattern.test(text);
}

function joinEnglish(values: string[]) {
  if (values.length <= 1) return values[0] ?? "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function articleFor(value: string) {
  return /^[aeiou]/i.test(value.trim()) ? "an" : "a";
}

type GenerateMockInput = {
  targetRole: string;
  sections: GenerateSection[];
  document: ResumeDocument;
};

/**
 * Build suggestions only from facts already present in the document. The
 * target role is used for framing, never as evidence of a skill or language.
 */
export function generateMockSuggestions({
  targetRole,
  sections,
  document,
}: GenerateMockInput): GenerationResult {
  const requested = new Set(sections);
  const notes: string[] = [];

  const experienceText = document.experience
    .flatMap((entry) => [
      entry.role,
      entry.company,
      entry.location,
      ...entry.bullets.map((bullet) => bullet.text),
    ])
    .join(" ");
  const projectText = document.projects
    .flatMap((project) => [
      project.name,
      project.description,
      ...project.bullets.map((bullet) => bullet.text),
    ])
    .join(" ");
  const summaryText = document.summary;
  const educationText = document.education
    .flatMap((entry) => [entry.school, entry.degree, entry.field, entry.details])
    .join(" ");
  const certificationText = document.certifications
    .flatMap((entry) => [entry.name, entry.issuer])
    .join(" ");
  const corpus = [
    summaryText,
    experienceText,
    educationText,
    document.skills.map((skill) => skill.name).join(" "),
    projectText,
    certificationText,
    document.languages.map((language) => language.name).join(" "),
  ]
    .join("\n")
    .toLowerCase();

  const existingSkills = document.skills
    .map((skill) => skill.name.trim())
    .filter(Boolean);
  const existingSkillKeys = new Set(
    existingSkills.map((skill) => skill.toLowerCase())
  );

  const skillSuggestions: SkillSuggestion[] = [];
  if (requested.has("skills")) {
    for (const skill of SKILL_LIBRARY) {
      if (skillSuggestions.length >= 12) break;
      if (existingSkills.some((existing) => existing.toLowerCase().includes(skill.name.toLowerCase()))) {
        continue;
      }
      const matched = skill.aliases.some((alias) => containsAlias(corpus, alias));
      if (!matched) continue;
      if (existingSkillKeys.has(skill.name.toLowerCase())) continue;

      let reason = "Mentioned in your resume.";
      if (skill.aliases.some((alias) => containsAlias(experienceText, alias))) {
        reason = "Mentioned in your experience.";
      } else if (
        skill.aliases.some((alias) => containsAlias(projectText, alias))
      ) {
        reason = "Mentioned in your projects.";
      } else if (
        skill.aliases.some((alias) => containsAlias(summaryText, alias))
      ) {
        reason = "Mentioned in your summary.";
      } else if (
        skill.aliases.some((alias) => containsAlias(educationText, alias))
      ) {
        reason = "Mentioned in your education.";
      } else if (
        skill.aliases.some((alias) => containsAlias(certificationText, alias))
      ) {
        reason = "Mentioned in your certifications.";
      }

      skillSuggestions.push({ name: skill.name, reason });
    }
    if (skillSuggestions.length === 0) {
      notes.push(
        "No new skills were found in your existing content. Add skills you have used, then generate again."
      );
    }
  }

  let summary: GenerationResult["summary"] = null;
  if (requested.has("summary")) {
    const latest = document.experience.find(
      (entry) => entry.role.trim() || entry.company.trim()
    );
    const role = latest?.role.trim() || "";
    const company = latest?.company.trim() || "";
    const strengths = [
      ...existingSkills,
      ...skillSuggestions.map((skill) => skill.name),
    ]
      .filter((value, index, array) => array.indexOf(value) === index)
      .slice(0, 4);

    const name = document.personal.fullName.trim();
    const parts: string[] = [];

    const isServiceRole =
      /cashier|barista|service|retail|waiter|waitress|clerk|receptionist|crew|customer/i.test(
        targetRole
      );

    if (isServiceRole) {
      if (name) {
        parts.push(
          `${name} is a friendly, dependable, and approachable professional dedicated to delivering welcoming service as ${articleFor(targetRole)} ${targetRole}.`
        );
      } else {
        parts.push(
          `Friendly, dependable, and approachable professional dedicated to delivering welcoming service as ${articleFor(targetRole)} ${targetRole}.`
        );
      }
      parts.push(
        "Brings strong communication skills, punctuality, and attentive focus to collaborative, fast-paced team environments."
      );
    } else {
      if (name && role) {
        parts.push(
          `${name} is ${articleFor(role)} ${role}${company ? ` at ${company}` : ""}.`
        );
      } else if (name) {
        parts.push(`${name} is targeting ${targetRole} roles.`);
      } else if (role) {
        parts.push(
          `Professional with experience as ${articleFor(role)} ${role}${company ? ` at ${company}` : ""}.`
        );
      } else {
        parts.push(`Professional targeting ${targetRole} roles.`);
      }

      if (strengths.length > 0) {
        parts.push(`Core strengths include ${joinEnglish(strengths)}.`);
      }

      if (role && role.toLowerCase() !== targetRole.toLowerCase()) {
        parts.push(`Now seeking ${targetRole} opportunities.`);
      }
    }

    summary = {
      original: document.summary.trim(),
      suggested: clip(parts.join(" "), 2_000),
    };
  }

  const projectHighlights: ProjectHighlightSuggestion[] = [];
  if (requested.has("projectHighlights")) {
    for (const project of document.projects) {
      const originalBullets = project.bullets
        .map((bullet) => bullet.text.trim())
        .filter(Boolean);
      const descriptionSentences = project.description
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .map((sentence) => clip(sentence, 500));
      const suggestedBullets = uniqueStrings(
        [...originalBullets, ...descriptionSentences],
        4
      );
      if (suggestedBullets.length === 0) continue;
      if (
        originalBullets.length === suggestedBullets.length &&
        originalBullets.every(
          (bullet, index) =>
            bullet.toLowerCase() === suggestedBullets[index]?.toLowerCase()
        )
      ) {
        continue;
      }
      projectHighlights.push({
        projectId: project.id,
        projectName: project.name.trim() || "Untitled project",
        originalBullets,
        suggestedBullets,
      });
    }
    if (projectHighlights.length === 0) {
      notes.push(
        "Add a project description or highlight first. Demo suggestions cannot invent projects."
      );
    }
  }

  const languages: LanguageSuggestion[] = [];
  if (requested.has("languages")) {
    for (const language of document.languages) {
      const suggestedName = normalizeLanguageName(language.name);
      const suggestedProficiency = normalizeProficiency(language.proficiency);
      if (!suggestedName && !suggestedProficiency) continue;
      if (
        suggestedName === language.name.trim() &&
        suggestedProficiency === language.proficiency.trim()
      ) {
        continue;
      }
      languages.push({
        languageId: language.id,
        originalName: language.name,
        originalProficiency: language.proficiency,
        suggestedName: suggestedName || language.name.trim(),
        suggestedProficiency: suggestedProficiency || language.proficiency.trim(),
        reason: "Standardized capitalization from your existing entry.",
      });
    }
    if (languages.length === 0) {
      notes.push(
        document.languages.length === 0
          ? "Add languages first. Demo suggestions only format entries already in your resume."
          : "Your language entries are already formatted. Demo suggestions never add fluency levels."
      );
    }
  }

  if (
    requested.has("summary") &&
    document.experience.length === 0 &&
    document.skills.length === 0
  ) {
    notes.push(
      "Add experience or skills for a more specific summary. Nothing was invented."
    );
  }

  return {
    summary,
    skills: skillSuggestions,
    projectHighlights,
    languages,
    notes: uniqueStrings(notes, 8),
  };
}
