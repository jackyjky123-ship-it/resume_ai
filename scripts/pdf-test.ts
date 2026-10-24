// Phase 6 PDF smoke test — exercises PDF engine, templates, and the export route.
// Run with:  npm run pdf:test
// Or:        npx tsx scripts/pdf-test.ts
/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

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

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  emptyResumeDocument,
  newExperienceEntry,
  newEducationEntry,
  newSkillEntry,
  newProjectEntry,
  newCertificationEntry,
  newLanguageEntry,
  newReferenceEntry,
  type ResumeDocument,
} from "../src/lib/validations/resume";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  console.error("FAIL: DATABASE_URL is not set.");
  process.exit(1);
}

const connectionString = rawConnectionString.replace(/([?&]sslmode=)require\b/, "$1verify-full");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

function cookieJar(): { header: string; add: (res: Response) => void } {
  const pairs = new Map<string, string>();
  return {
    add(res) {
      for (const raw of res.headers.getSetCookie()) {
        pairs.set(raw.split(";")[0]?.split("=")[0] ?? "", raw.split(";")[0] ?? "");
      }
    },
    get header() {
      return [...pairs.values()].join("; ");
    },
  };
}

async function cleanupTestRows() {
  await prisma.user.deleteMany({ where: { email: { startsWith: "phase6-" } } });
  await prisma.$executeRawUnsafe(
    `DELETE FROM neon_auth."user" WHERE email LIKE 'phase6-%@example.com'`
  );
}

function samplePopulatedResume(): ResumeDocument {
  const doc = emptyResumeDocument();
  doc.personal = {
    fullName: "Alex Rivera",
    roleApplied: "Senior Systems Architect",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 349-2041",
    location: "Seattle, WA",
    website: "https://rivera-systems.dev",
    linkedin: "https://linkedin.com/in/alex-rivera-cloud",
    github: "https://github.com/alexrivera",
    telegram: "",
    photoUrl: "",
    gender: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    strengths: "",
  };
  doc.summary =
    "Cloud & Distributed Systems Architect with 8+ years designing fault-tolerant microservices, resilient event pipelines, and high-throughput data platforms. Proven track record driving 99.999% availability and optimizing latency by 45%.";

  const exp1 = newExperienceEntry();
  exp1.company = "Stripe / Infrastructure";
  exp1.role = "Lead Distributed Systems Engineer";
  exp1.location = "Seattle, WA";
  exp1.startDate = "2021";
  exp1.current = true;
  exp1.bullets = [
    { id: "b1", text: "Architected real-time settlement pipeline processing $140M daily with sub-second finality." },
    { id: "b2", text: "Reduced p99 API latency across core payment ingress by 38ms through connection pooling and protocol migration." },
    { id: "b3", text: "Mentored 12 engineers across 3 timezones on event-driven reliability and disaster recovery runbooks." },
  ];

  const exp2 = newExperienceEntry();
  exp2.company = "Amazon Web Services (AWS)";
  exp2.role = "Senior Cloud Solutions Architect";
  exp2.location = "Seattle, WA";
  exp2.startDate = "2018";
  exp2.endDate = "2021";
  exp2.current = false;
  exp2.bullets = [
    { id: "b4", text: "Migrated 40+ legacy monoliths to containerized Amazon EKS clusters with automated canary deployments." },
    { id: "b5", text: "Spearheaded cost-optimization initiative saving $1.8M annually through spot instances and storage tiering." },
  ];

  doc.experience = [exp1, exp2];

  const edu = newEducationEntry();
  edu.school = "University of Washington";
  edu.degree = "B.S.";
  edu.field = "Computer Science & Engineering";
  edu.startDate = "2014";
  edu.endDate = "2018";
  edu.details = "Magna Cum Laude · Focus on Distributed Systems and High Performance Computing.";
  doc.education = [edu];

  const s1 = newSkillEntry();
  s1.name = "Go";
  const s2 = newSkillEntry();
  s2.name = "Kubernetes";
  const s3 = newSkillEntry();
  s3.name = "PostgreSQL";
  const s4 = newSkillEntry();
  s4.name = "Distributed Systems";
  const s5 = newSkillEntry();
  s5.name = "Terraform";
  const s6 = newSkillEntry();
  s6.name = "Rust";
  doc.skills = [s1, s2, s3, s4, s5, s6];

  const p1 = newProjectEntry();
  p1.name = "FluxKV — Embedded Distributed KV Store";
  p1.url = "https://github.com/alexrivera/fluxkv";
  p1.description = "Raft-consensus replicated key-value storage engine in Rust with pluggable WAL storage.";
  p1.bullets = [
    { id: "pb1", text: "Benchmarks showed 220,000 read ops/sec with quorum consistency under chaos network partitions." },
  ];
  doc.projects = [p1];

  const c1 = newCertificationEntry();
  c1.name = "AWS Certified Solutions Architect — Professional";
  c1.issuer = "Amazon Web Services";
  c1.issueDate = "2023";
  doc.certifications = [c1];

  const l1 = newLanguageEntry();
  l1.name = "English";
  l1.proficiency = "Native";
  const l2 = newLanguageEntry();
  l2.name = "Spanish";
  l2.proficiency = "Fluent";
  doc.languages = [l1, l2];

  const r1 = newReferenceEntry();
  r1.name = "Morgan Lee";
  r1.position = "Director of Platform Engineering";
  r1.workplace = "Stripe / Infrastructure";
  r1.email = "morgan.lee@example.com";
  r1.phone = "206-555-0142";
  doc.references = [r1];

  return doc;
}

function sampleMultiPageResume(): ResumeDocument {
  const doc = samplePopulatedResume();
  // Duplicate experience entries to test multi-page pagination and wrapping
  for (let i = 0; i < 4; i++) {
    const extra = newExperienceEntry();
    extra.company = `Enterprise Platform Corp #${i + 1}`;
    extra.role = "Senior Infrastructure Consultant";
    extra.startDate = `201${i}`;
    extra.endDate = `201${i + 1}`;
    extra.bullets = [
      { id: `eb-${i}-1`, text: "Designed zero-trust network architectures adhering to SOC2 Type II compliance frameworks." },
      { id: `eb-${i}-2`, text: "Implemented distributed tracing across 80+ microservices using OpenTelemetry and Jaeger." },
      { id: `eb-${i}-3`, text: "Conducted automated chaos experiments simulating cross-region data center outages." },
    ];
    doc.experience.push(extra);
  }
  return doc;
}

async function testUnitPdfGeneration() {
  console.log("\n1. Unit tests: PDF engine and template rendering");

  const { renderResumePdf, formatResumePdfFilename } = await import(
    "../src/server/services/pdf.service"
  );

  // Filename formatting
  const fn1 = formatResumePdfFilename("Jane Doe", "My Resume");
  assert(fn1 === "Jane_Doe.pdf", `formatResumePdfFilename cleans name ("${fn1}")`);

  const fn2 = formatResumePdfFilename("", "Software Engineer Resume 2026");
  assert(fn2 === "Software_Engineer_Resume_2026.pdf", `formatResumePdfFilename uses fallback title ("${fn2}")`);

  // Render Classic template
  const doc = samplePopulatedResume();
  const classicBuffer = await renderResumePdf(doc, "classic");
  assert(Buffer.isBuffer(classicBuffer), "Classic PDF renders to Buffer");
  assert(classicBuffer.length > 2000, `Classic PDF buffer is non-empty (${classicBuffer.length} bytes)`);
  assert(classicBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Classic PDF has valid %PDF- magic bytes");

  // Render Modern template
  const modernBuffer = await renderResumePdf(doc, "modern");
  assert(Buffer.isBuffer(modernBuffer), "Modern PDF renders to Buffer");
  assert(modernBuffer.length > 2000, `Modern PDF buffer is non-empty (${modernBuffer.length} bytes)`);
  assert(modernBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Modern PDF has valid %PDF- magic bytes");

  // Render Compact template
  const compactBuffer = await renderResumePdf(doc, "compact");
  assert(Buffer.isBuffer(compactBuffer), "Compact PDF renders to Buffer");
  assert(compactBuffer.length > 2000, `Compact PDF buffer is non-empty (${compactBuffer.length} bytes)`);
  assert(compactBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Compact PDF has valid %PDF- magic bytes");

  // Render Professional template
  const professionalBuffer = await renderResumePdf(doc, "professional");
  assert(Buffer.isBuffer(professionalBuffer), "Professional PDF renders to Buffer");
  assert(professionalBuffer.length > 2000, `Professional PDF buffer is non-empty (${professionalBuffer.length} bytes)`);
  assert(professionalBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Professional PDF has valid %PDF- magic bytes");

  // Render Editorial template
  const editorialBuffer = await renderResumePdf(doc, "editorial");
  assert(Buffer.isBuffer(editorialBuffer), "Editorial PDF renders to Buffer");
  assert(editorialBuffer.length > 2000, `Editorial PDF buffer is non-empty (${editorialBuffer.length} bytes)`);
  assert(editorialBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Editorial PDF has valid %PDF- magic bytes");

  // Render Designer template
  const designerBuffer = await renderResumePdf(doc, "designer");
  assert(Buffer.isBuffer(designerBuffer), "Designer PDF renders to Buffer");
  assert(designerBuffer.length > 2000, `Designer PDF buffer is non-empty (${designerBuffer.length} bytes)`);
  assert(designerBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Designer PDF has valid %PDF- magic bytes");

  // Render Navy template
  const navyBuffer = await renderResumePdf(doc, "navy");
  assert(Buffer.isBuffer(navyBuffer), "Navy PDF renders to Buffer");
  assert(navyBuffer.length > 2000, `Navy PDF buffer is non-empty (${navyBuffer.length} bytes)`);
  assert(navyBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Navy PDF has valid %PDF- magic bytes");

  // Render empty resume document (must not crash)
  const emptyDoc = emptyResumeDocument();
  const emptyBuffer = await renderResumePdf(emptyDoc, "classic");
  assert(emptyBuffer.length > 1000, `Empty resume PDF renders cleanly (${emptyBuffer.length} bytes)`);
  assert(emptyBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Empty resume PDF has valid magic bytes");

  // Render long multi-page resume (multi-page wrapping and pagination test)
  const longDoc = sampleMultiPageResume();
  const multiPageBuffer = await renderResumePdf(longDoc, "modern");
  assert(multiPageBuffer.length > 5000, `Multi-page PDF renders successfully (${multiPageBuffer.length} bytes)`);
  assert(multiPageBuffer.subarray(0, 5).toString("ascii") === "%PDF-", "Multi-page PDF has valid magic bytes");
}

async function testExportRoute(serverAvailable: boolean) {
  if (!serverAvailable) {
    console.log("\n2. Route tests: SKIPPED (server is not running on :3000)");
    return;
  }

  console.log("\n2. Integration tests: GET /api/resumes/[resumeId]/pdf route");

  // Anonymous request must be rejected with 401
  const anonRes = await fetch(`${BASE}/api/resumes/some-fake-id/pdf`);
  assert(anonRes.status === 401, `Anonymous export rejected with 401 (got ${anonRes.status})`);

  // Sign up Owner User
  const ownerEmail = `phase6-owner-${Date.now()}@example.com`;
  const ownerJar = cookieJar();
  const ownerSignup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ownerEmail, password: "password-1234", name: "Phase6 Owner" }),
  });
  ownerJar.add(ownerSignup);
  assert(ownerSignup.ok, `Owner signs up (${ownerSignup.status})`);

  // Touch dashboard to lazily create the App User record
  const dashRes = await fetch(`${BASE}/dashboard`, { headers: { cookie: ownerJar.header } });
  ownerJar.add(dashRes);
  const dashHtml = await dashRes.text();
  assert(dashRes.ok && dashHtml.includes(ownerEmail), "Owner hits dashboard to initialize app user");

  // Find owner's app user
  const ownerUser = await prisma.user.findFirst({ where: { email: ownerEmail } });
  assert(Boolean(ownerUser), "Owner app User found in database");

  // Create a resume for the owner
  const resume = await prisma.resume.create({
    data: {
      userId: ownerUser!.id,
      title: "Owner Systems Resume",
      templateId: "modern",
      content: samplePopulatedResume() as unknown as object,
    },
  });
  assert(Boolean(resume.id), `Resume created in DB (id: ${resume.id})`);

  // Request the PDF as Owner -> must succeed with 200 and application/pdf
  const ownerPdfRes = await fetch(`${BASE}/api/resumes/${resume.id}/pdf`, {
    headers: { Cookie: ownerJar.header },
  });
  assert(ownerPdfRes.status === 200, `Owner receives 200 OK for PDF (got ${ownerPdfRes.status})`);
  assert(
    ownerPdfRes.headers.get("Content-Type")?.includes("application/pdf") ?? false,
    "Response has Content-Type: application/pdf"
  );
  const disposition = ownerPdfRes.headers.get("Content-Disposition") || "";
  assert(disposition.includes("attachment"), "Response has Content-Disposition: attachment");
  assert(disposition.includes(".pdf"), `Content-Disposition includes .pdf filename: ${disposition}`);

  const pdfBytes = Buffer.from(await ownerPdfRes.arrayBuffer());
  assert(pdfBytes.subarray(0, 5).toString("ascii") === "%PDF-", "Route response starts with %PDF-");

  // Test cross-user protection: Sign up Other User
  const otherEmail = `phase6-other-${Date.now()}@example.com`;
  const otherJar = cookieJar();
  const otherSignup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: otherEmail, password: "password-1234", name: "Phase6 Other" }),
  });
  otherJar.add(otherSignup);
  assert(otherSignup.ok, `Other user signs up (${otherSignup.status})`);

  const otherDash = await fetch(`${BASE}/dashboard`, { headers: { cookie: otherJar.header } });
  otherJar.add(otherDash);
  const otherHtml = await otherDash.text();
  assert(otherDash.ok && otherHtml.includes(otherEmail), "Other user hits dashboard to initialize app user");

  // Other user attempts to export Owner's resume -> MUST return 404 (no leak!)
  const crossUserRes = await fetch(`${BASE}/api/resumes/${resume.id}/pdf`, {
    headers: { Cookie: otherJar.header },
  });
  assert(
    crossUserRes.status === 404,
    `Cross-user PDF export is blocked with 404 (got ${crossUserRes.status})`
  );
}

async function main() {
  console.log("=== Phase 6 PDF & Templates Smoke Test ===");
  try {
    await testUnitPdfGeneration();

    let serverAvailable = false;
    try {
      const probe = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(10000) });
      serverAvailable = probe.ok || probe.status === 404 || probe.status === 401;
    } catch {
      serverAvailable = false;
    }

    await testExportRoute(serverAvailable);
    console.log("\nPASS: Phase 6 PDF engine and export tests succeeded!");
  } finally {
    await cleanupTestRows();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\nFAIL:", err);
  process.exit(1);
});
