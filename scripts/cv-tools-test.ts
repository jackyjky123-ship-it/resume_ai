// CV tools unit checks (no server or database required).
// Run with: npm run cv:test
/* eslint-disable no-console */
import {
  generateMockSuggestions,
  parseResumeTextLocally,
} from "../src/lib/mock-ai";
import { mergeResumeDocuments, withFreshIds } from "../src/lib/resume-import";
import {
  emptyResumeDocument,
  newBullet,
  newExperienceEntry,
  newSkillEntry,
  resumeDocumentSchema,
} from "../src/lib/validations/resume";

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

const SAMPLE_CV = `Amara Chen
Toronto, Canada
amara@example.com | +1 555 010 7788

https://amara.dev | linkedin.com/in/amara | github.com/amara

SUMMARY
Frontend developer with six years of experience shipping accessible products.

EXPERIENCE
Senior Frontend Developer | Northstar Labs | Jan 2022 - Present
- Built a React and TypeScript design system used across four products.
- Improved performance by 40 percent with route-level code splitting.

Product Developer at Brightline | Jun 2019 - Dec 2021
- Delivered a Next.js marketing site and accessible component library.

EDUCATION
University of Toronto
BSc in Computer Science
2015 - 2019

SKILLS
TypeScript, React, Next.js, Accessibility

PROJECTS
Bloom — plant care tracker
A React app that helps people keep houseplants alive.
- Built a scheduling engine with notifications.
- Reached 2,000 active users in the first year.

CERTIFICATIONS
AWS Certified Cloud Practitioner — Amazon Web Services — 2024

LANGUAGES
English (Native)
Spanish — B2
`;

console.log("CV parser");
const parsed = parseResumeTextLocally(SAMPLE_CV);
const document = parsed.document;
const schema = resumeDocumentSchema.safeParse(document);
assert(schema.success, "parsed document passes ResumeDocument validation");
assert(document.personal.fullName === "Amara Chen", "reads full name");
assert(document.personal.email === "amara@example.com", "reads email");
assert(
  document.personal.phone.replace(/\D/g, "").endsWith("5550107788"),
  "reads phone from a mixed contact line"
);
assert(document.personal.location === "Toronto, Canada", "reads location");
assert(
  document.personal.website === "https://amara.dev",
  "reads website"
);
assert(
  document.personal.linkedin === "linkedin.com/in/amara",
  "reads LinkedIn"
);
assert(document.personal.github === "github.com/amara", "reads GitHub");
assert(document.summary.includes("accessible products"), "reads summary");
assert(document.experience.length === 2, "reads two experience entries");
assert(
  document.experience[0]?.role === "Senior Frontend Developer" &&
    document.experience[0]?.company === "Northstar Labs",
  "splits role and company"
);
assert(
  document.experience[0]?.current === true &&
    document.experience[0]?.startDate === "Jan 2022",
  "reads current role dates"
);
assert(
  document.experience[0]?.bullets.length === 2,
  "reads experience bullets"
);
assert(
  document.experience[1]?.role === "Product Developer" &&
    document.experience[1]?.company === "Brightline",
  "splits an 'at' role header"
);
assert(
  document.education[0]?.school === "University of Toronto" &&
    document.education[0]?.degree === "BSc" &&
    document.education[0]?.field === "Computer Science",
  "reads education degree and field"
);
assert(document.skills.length === 4, "reads skills");
assert(document.projects.length === 1, "reads projects");
assert(
  document.projects[0]?.bullets.length === 2,
  "reads project highlights"
);
assert(
  document.certifications[0]?.name === "AWS Certified Cloud Practitioner",
  "reads certification"
);
assert(document.languages.length === 2, "reads languages");
assert(
  document.languages[0]?.name === "English" &&
    document.languages[0]?.proficiency === "Native",
  "reads parenthesized language proficiency"
);
assert(
  document.languages[1]?.name === "Spanish" &&
    document.languages[1]?.proficiency === "B2",
  "reads dashed language proficiency"
);

const allIds = [
  ...document.experience.flatMap((entry) => [
    entry.id,
    ...entry.bullets.map((bullet) => bullet.id),
  ]),
  ...document.education.map((entry) => entry.id),
  ...document.skills.map((entry) => entry.id),
  ...document.projects.flatMap((entry) => [
    entry.id,
    ...entry.bullets.map((bullet) => bullet.id),
  ]),
  ...document.certifications.map((entry) => entry.id),
  ...document.languages.map((entry) => entry.id),
];
assert(new Set(allIds).size === allIds.length, "all imported IDs are unique");

console.log("Import transforms");
const current = emptyResumeDocument();
current.personal.fullName = "Current Name";
current.personal.email = "current@example.com";
const currentExperience = newExperienceEntry();
currentExperience.role = "Current Role";
currentExperience.bullets = [{ ...newBullet(), text: "Current bullet" }];
current.experience = [currentExperience];
const currentSkill = newSkillEntry();
currentSkill.name = "React";
current.skills = [currentSkill];

const merged = mergeResumeDocuments(current, document);
assert(
  merged.personal.fullName === "Current Name" &&
    merged.personal.email === "current@example.com",
  "merge keeps existing personal values"
);
assert(
  merged.personal.location === "Toronto, Canada",
  "merge fills empty personal values"
);
assert(merged.summary === document.summary, "merge fills an empty summary");
assert(merged.experience.length === 3, "merge appends imported experience");
assert(
  merged.experience[1]?.id !== document.experience[0]?.id,
  "merge assigns fresh experience IDs"
);
assert(
  merged.experience[1]?.bullets[0]?.id !==
    document.experience[0]?.bullets[0]?.id,
  "merge assigns fresh bullet IDs"
);
assert(
  merged.skills.filter((skill) => skill.name.toLowerCase() === "react")
    .length === 1,
  "merge deduplicates skills"
);
assert(
  merged.skills.some((skill) => skill.name === "TypeScript"),
  "merge adds imported skills"
);

const replaced = withFreshIds(document);
assert(
  replaced.personal.fullName === document.personal.fullName &&
    replaced.experience[0]?.id !== document.experience[0]?.id,
  "replace keeps values but assigns fresh IDs"
);

console.log("Grounded suggestions");
const suggestions = generateMockSuggestions({
  targetRole: "Staff Frontend Engineer",
  sections: ["summary", "skills", "projectHighlights", "languages"],
  document,
});
assert(suggestions.summary !== null, "generates a summary suggestion");
assert(
  suggestions.summary?.suggested.includes("Amara Chen") &&
    suggestions.summary?.suggested.includes("Northstar Labs"),
  "summary uses existing resume facts"
);
assert(
  suggestions.summary?.suggested.includes("Staff Frontend Engineer"),
  "summary uses the target role"
);
assert(
  suggestions.summary?.suggested.includes("40 percent") === false,
  "summary does not invent or copy metrics into new claims"
);
const corpus = SAMPLE_CV.toLowerCase();
assert(
  suggestions.skills.every((skill) => corpus.includes(skill.name.toLowerCase())),
  "every suggested skill appears in the source content"
);
assert(
  suggestions.skills.every((skill) => skill.name !== "Python"),
  "no unrelated skill is invented"
);
assert(
  suggestions.projectHighlights.every((project) =>
    document.projects.some((entry) => entry.id === project.projectId)
  ),
  "project suggestions target existing projects"
);
assert(
  suggestions.languages.every((language) =>
    document.languages.some((entry) => entry.id === language.languageId)
  ),
  "language suggestions target existing languages"
);

const languageDocument = emptyResumeDocument();
languageDocument.languages = [
  { id: "lang-1", name: "english", proficiency: "native" },
];
const languageSuggestions = generateMockSuggestions({
  targetRole: "Product Designer",
  sections: ["languages"],
  document: languageDocument,
});
assert(
  languageSuggestions.languages[0]?.suggestedName === "English" &&
    languageSuggestions.languages[0]?.suggestedProficiency === "Native",
  "language suggestions only reformat existing entries"
);
assert(
  languageSuggestions.languages.length === 1 &&
    languageDocument.languages.length === 1,
  "language suggestions never add a language"
);

const emptyDocument = emptyResumeDocument();
const emptySuggestions = generateMockSuggestions({
  targetRole: "Data Scientist",
  sections: ["summary", "skills", "projectHighlights", "languages"],
  document: emptyDocument,
});
assert(
  emptySuggestions.skills.length === 0,
  "empty resume cannot produce invented skills"
);
assert(
  emptySuggestions.projectHighlights.length === 0,
  "empty resume cannot produce invented projects"
);
assert(
  emptySuggestions.languages.length === 0,
  "empty resume cannot produce invented languages"
);

console.log("\nAll CV tools checks passed.");
