// Comprehensive Phase 7 Unit Test Suite
// Covers:
// 1. Resume content schema validation & length constraints
// 2. Resume normalization & parsing helpers
// 3. AI input and output schema validations
// 4. Sample data generator validity
// 5. Template metadata and relative time formatting
// 6. Filename sanitization & PDF utilities
// 7. PDF photo sanitization (SSRF guards)
// 8. Resume preview rendering across every template
/* eslint-disable no-console */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Bypass Next.js 'server-only' guard for standalone test scripts
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  } as unknown as NodeModule;
} catch {
  // Ignore if not found
}
import {
  emptyResumeDocument,
  newExperienceEntry,
  newEducationEntry,
  newSkillEntry,
  newProjectEntry,
  newCertificationEntry,
  newLanguageEntry,
  newReferenceEntry,
  newBullet,
  parseResumeDocument,
  resumeDocumentSchema,
  createResumeId,
  type ResumeDocument,
} from "../src/lib/validations/resume";
import {
  improveBulletResultSchema,
  fixGrammarResultSchema,
  generationResultSchema,
} from "../src/lib/validations/ai";
import {
  TEMPLATE_IDS,
  TEMPLATES,
  TEMPLATE_NAME,
  formatRelativeTime,
  type TemplateId,
} from "../src/lib/resume-meta";
import { filledSectionsOf } from "../src/lib/resume-content";
import { createSampleResumeDocument } from "../src/lib/sample-data";
import { LanguageProvider } from "../src/lib/i18n/context";
import { ResumeBody } from "../src/components/resume-preview/resume-body";

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${label}`);
  }
  console.log(`  ok ${label}`);
}

function testResumeDocumentSchema() {
  console.log("\n1. Resume Document Schema & Validation");

  // Empty document passes
  const empty = emptyResumeDocument();
  assert(resumeDocumentSchema.safeParse(empty).success, "emptyResumeDocument() passes schema");
  assert(empty.version === 1, "version is 1");

  // Sample populated document passes
  const sample = createSampleResumeDocument();
  const parsed = resumeDocumentSchema.safeParse(sample);
  assert(parsed.success, "createSampleResumeDocument() passes schema");

  // Incomplete draft is valid
  const draft = emptyResumeDocument();
  draft.personal.fullName = "Test User";
  draft.personal.email = ""; // empty string is valid
  assert(resumeDocumentSchema.safeParse(draft).success, "draft with empty optional email is valid");

  // Invalid email format is rejected
  const badEmail = emptyResumeDocument();
  badEmail.personal.email = "not-an-email" as unknown as "";
  assert(!resumeDocumentSchema.safeParse(badEmail).success, "invalid email string is rejected");

  // Overlong bullet is rejected (max 500 chars)
  const longExp = newExperienceEntry();
  longExp.bullets = [{ id: createResumeId(), text: "a".repeat(501) }];
  const docWithLongBullet = emptyResumeDocument();
  docWithLongBullet.experience = [longExp];
  assert(!resumeDocumentSchema.safeParse(docWithLongBullet).success, "over-500 char bullet is rejected");

  // Array limits enforced (max 12 bullets per experience)
  const maxBulletsExp = newExperienceEntry();
  maxBulletsExp.bullets = Array.from({ length: 13 }, (_, i) => ({
    id: createResumeId(),
    text: `Bullet ${i}`,
  }));
  const docWith13Bullets = emptyResumeDocument();
  docWith13Bullets.experience = [maxBulletsExp];
  assert(!resumeDocumentSchema.safeParse(docWith13Bullets).success, "more than 12 bullets per job is rejected");

  // Stable IDs are required and non-empty
  const expWithoutId = newExperienceEntry();
  (expWithoutId as { id: string }).id = "";
  const docWithBlankId = emptyResumeDocument();
  docWithBlankId.experience = [expWithoutId];
  assert(!resumeDocumentSchema.safeParse(docWithBlankId).success, "blank entry ID is rejected");

  // Factory functions generate unique IDs
  const id1 = createResumeId();
  const id2 = createResumeId();
  assert(id1.length > 5 && id2.length > 5 && id1 !== id2, "createResumeId() produces unique non-empty IDs");

  const b1 = newBullet();
  assert(Boolean(b1.id) && b1.text === "", "newBullet() returns initialized blank bullet");
}

function testNormalizationAndParsing() {
  console.log("\n2. Normalization & Defensive Parsing");

  // Malformed JSON/object gracefully falls back to empty document
  const garbage = { foo: "bar", notAResume: true };
  const normalized = parseResumeDocument(garbage);
  assert(normalized.version === 1, "unreadable object falls back to version 1 document");
  assert(normalized.experience.length === 0, "fallback document has empty experience");

  // Null and undefined fall back
  assert(parseResumeDocument(null).version === 1, "null falls back to valid document");
  assert(parseResumeDocument(undefined).version === 1, "undefined falls back to valid document");

  // Valid document round-trips cleanly through parseResumeDocument
  const validDoc = emptyResumeDocument();
  validDoc.personal.fullName = "Jane Doe";
  validDoc.summary = "A brief summary";
  const parsedValid = parseResumeDocument(validDoc);
  assert(parsedValid.personal.fullName === "Jane Doe", "valid document preserves fullName");
  assert(parsedValid.summary === "A brief summary", "valid document preserves summary");
}

function testSectionComputation() {
  console.log("\n3. Section Detection & Helpers");

  const empty = emptyResumeDocument();
  assert(filledSectionsOf(empty).length === 0, "empty document has 0 filled sections");

  const withContact = emptyResumeDocument();
  withContact.personal.fullName = "Alex Rivera";
  assert(
    filledSectionsOf(withContact).includes("Contact"),
    "fullName alone marks Contact section filled"
  );

  const sample = createSampleResumeDocument();
  const filled = filledSectionsOf(sample);
  assert(filled.includes("Contact"), "sample has Contact");
  assert(filled.includes("Experience"), "sample has Experience");
  assert(filled.includes("Education"), "sample has Education");
  assert(filled.includes("Skills"), "sample has Skills");
  assert(filled.includes("Projects"), "sample has Projects");
}

function testTemplateMetadata() {
  console.log("\n4. Template Metadata & IDs");

  assert(TEMPLATE_IDS.length === 7, "7 templates are registered");
  assert(TEMPLATE_IDS.includes("classic"), "Classic template ID exists");
  assert(TEMPLATE_IDS.includes("modern"), "Modern template ID exists");
  assert(TEMPLATE_IDS.includes("compact"), "Compact template ID exists");
  assert(TEMPLATE_IDS.includes("professional"), "Professional template ID exists");
  assert(TEMPLATE_IDS.includes("editorial"), "Editorial template ID exists");
  assert(TEMPLATE_IDS.includes("designer"), "Designer template ID exists");
  assert(TEMPLATE_IDS.includes("navy"), "Navy template ID exists");

  assert(TEMPLATES.length === 7, "TEMPLATES array has 7 items");
  for (const t of TEMPLATES) {
    assert(Boolean(t.id && t.name && t.blurb), `Template "${t.name}" has id, name, and blurb`);
    assert(TEMPLATE_NAME[t.id] === t.name, `TEMPLATE_NAME maps ${t.id} to ${t.name}`);
  }
}

async function testFormattingHelpers() {
  console.log("\n5. Formatting & Filename Helpers");

  const { formatResumePdfFilename } = await import(
    "../src/server/services/pdf.service"
  );

  // formatResumePdfFilename
  const fn1 = formatResumePdfFilename("Jane Doe", "Software Engineer");
  assert(fn1 === "Jane_Doe.pdf", "formatResumePdfFilename uses full name when available");

  const fn2 = formatResumePdfFilename("", "Lead Infrastructure Engineer 2026");
  assert(fn2 === "Lead_Infrastructure_Engineer_2026.pdf", "formatResumePdfFilename uses title as fallback");

  const fn3 = formatResumePdfFilename("", "");
  assert(fn3 === "Resume.pdf", "formatResumePdfFilename uses 'Resume.pdf' when both are blank");

  const fn4 = formatResumePdfFilename("Jane / Doe : Systems * Lead", "");
  assert(!/[/:*?"<>|\\]/.test(fn4), "formatResumePdfFilename strips illegal filename characters");

  // formatRelativeTime
  const now = new Date();
  const justNow = formatRelativeTime(now);
  assert(justNow === "just now", `formatRelativeTime(now) returns 'just now' (got '${justNow}')`);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const fiveMinStr = formatRelativeTime(fiveMinutesAgo);
  assert(fiveMinStr.includes("5m") || fiveMinStr.includes("min"), `formatRelativeTime(5m ago) gives reasonable relative time ('${fiveMinStr}')`);
}

function testAiSchemas() {
  console.log("\n6. AI Validation Schemas");

  // Bullet improvement schema
  const validBullet = {
    improvedBullet: "Spearheaded zero-trust migration across 40 services.",
    explanation: "Replaced passive phrasing with strong action verb and clear scope.",
  };
  assert(improveBulletResultSchema.safeParse(validBullet).success, "improveBulletResultSchema accepts valid object");

  const emptyBullet = { improvedBullet: "", explanation: "reason" };
  assert(!improveBulletResultSchema.safeParse(emptyBullet).success, "empty improvedBullet is rejected");

  // Grammar fix schema
  const validGrammar = {
    correctedText: "I have been building distributed systems for over six years.",
    explanation: "Fixed subject-verb agreement and preposition.",
  };
  assert(fixGrammarResultSchema.safeParse(validGrammar).success, "fixGrammarResultSchema accepts valid object");

  // Generate CV output schema
  const validGenerate = {
    summary: {
      original: "Software engineer.",
      suggested: "Principal software architect specializing in distributed data pipelines.",
    },
    skills: [{ name: "Kubernetes", reason: "Found in experience section" }],
    projectHighlights: [],
    languages: [],
    notes: ["Strong distributed systems background."],
  };
  assert(generationResultSchema.safeParse(validGenerate).success, "generationResultSchema accepts valid structured output");
}

function testSampleDataIntegrity() {
  console.log("\n7. Sample Data Generator Integrity");

  const doc1 = createSampleResumeDocument();
  const doc2 = createSampleResumeDocument();

  assert(doc1.experience.length >= 3, "sample has at least 3 experience entries");
  assert(doc1.skills.length >= 5, "sample has at least 5 skills");
  assert(doc1.education.length >= 1, "sample has education");
  assert(doc1.certifications.length >= 1, "sample has certifications");
  assert(doc1.languages.length >= 2, "sample has languages");
  assert(doc1.projects.length >= 2, "sample has projects");

  // Ensure fresh IDs across calls
  assert(doc1.experience[0].id !== doc2.experience[0].id, "createSampleResumeDocument() produces fresh unique IDs per call");
  assert(doc1.skills[0].id !== doc2.skills[0].id, "skill IDs are unique across calls");
}

async function testPdfPhotoSanitization() {
  console.log("\n8. PDF Photo Sanitization (SSRF guards)");

  // Dynamic import so the 'server-only' cache bypass above is active first.
  const { resolveSafePhotoDataUrl } = await import("../src/server/pdf/photo");

  assert((await resolveSafePhotoDataUrl("")) === "", "empty photo stays empty");

  const jpeg = "data:image/jpeg;base64,/9j/";
  assert((await resolveSafePhotoDataUrl(jpeg)) === jpeg, "valid JPEG data URL is preserved");

  assert(
    (await resolveSafePhotoDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")) === "",
    "SVG data URLs are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("data:image/png;base64,/9j/")) === "",
    "mismatched declared image type is rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("http://example.com/photo.jpg")) === "",
    "non-HTTPS remote photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("ftp://example.com/photo.jpg")) === "",
    "non-HTTP schemes are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://localhost/photo.jpg")) === "",
    "localhost remote photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://127.0.0.1/photo.jpg")) === "",
    "loopback IP photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://169.254.169.254/latest/meta-data")) === "",
    "link-local metadata IPs are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://[::1]/photo.jpg")) === "",
    "IPv6 loopback photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://[::127.0.0.1]/photo.jpg")) === "",
    "IPv4-compatible IPv6 loopback photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://[::c0a8:101]/photo.jpg")) === "",
    "IPv4-compatible private IPv6 photos are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://[2001:db8::1]/photo.jpg")) === "",
    "IPv6 documentation addresses are rejected"
  );
  assert(
    (await resolveSafePhotoDataUrl("https://[2002:7f00:1::1]/photo.jpg")) === "",
    "6to4 addresses that embed IPv4 are rejected"
  );
}

function renderPreview(document: ResumeDocument, templateId: TemplateId) {
  return renderToStaticMarkup(
    React.createElement(
      LanguageProvider,
      null,
      React.createElement(ResumeBody, { document, templateId })
    )
  );
}

function testPreviewRendering() {
  console.log("\n9. Resume Preview Rendering");

  const doc = emptyResumeDocument();
  doc.personal.fullName = "Preview Tester";
  doc.references = [
    {
      ...newReferenceEntry(),
      name: "Dara Sok",
      position: "Engineering Manager",
      workplace: "Ridgeview Code Lab",
    },
  ];

  for (const templateId of TEMPLATE_IDS) {
    const html = renderPreview(doc, templateId);
    assert(html.includes("Preview Tester"), `${templateId} preview renders personal details`);
    assert(html.includes("Dara Sok"), `${templateId} preview renders references`);
  }

  const phoneOnly = emptyResumeDocument();
  phoneOnly.references = [{ ...newReferenceEntry(), phone: "555-0100" }];
  for (const templateId of TEMPLATE_IDS) {
    const html = renderPreview(phoneOnly, templateId);
    assert(html.includes("555-0100"), `${templateId} preview renders phone-only references`);
  }

  const blankHtml = renderPreview(emptyResumeDocument(), "classic");
  assert(
    blankHtml.includes("Your preview starts here."),
    "blank drafts show the empty-state message"
  );
  assert(!blankHtml.includes("Dara Sok"), "blank drafts never render reference data");

  const strengthsOnly = emptyResumeDocument();
  strengthsOnly.personal.strengths = "Fast learner, Calm under pressure";
  const navyHtml = renderPreview(strengthsOnly, "navy");
  assert(
    navyHtml.includes("Fast learner"),
    "navy preview renders strengths-only drafts instead of the empty state"
  );
  assert(
    !navyHtml.includes("Your preview starts here."),
    "strengths-only drafts are not treated as blank"
  );
}

async function main() {
  console.log("=== Phase 7 Unit Test Suite ===");
  testResumeDocumentSchema();
  testNormalizationAndParsing();
  testSectionComputation();
  testTemplateMetadata();
  await testFormattingHelpers();
  testAiSchemas();
  testSampleDataIntegrity();
  await testPdfPhotoSanitization();
  testPreviewRendering();
  console.log("\nPASS: All Phase 7 unit tests passed successfully!\n");
}

main().catch((err) => {
  console.error("\nFAIL in unit tests:", err);
  process.exit(1);
});
