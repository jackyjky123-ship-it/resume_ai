// Phase 4 editor smoke test — needs the app running on :3000 (npm start).
// Run with:  npx tsx scripts/editor-test.ts
// Covers: ResumeDocument schema guards, persistence + ownership at the Prisma
// layer, and the protected editor route (own resume renders, cross-user and
// anonymous access do not). Cleans up its test users afterwards.
/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  emptyResumeDocument,
  newEducationEntry,
  newExperienceEntry,
  newLanguageEntry,
  newProjectEntry,
  newSkillEntry,
  parseResumeDocument,
  resumeDocumentSchema,
} from "../src/lib/validations/resume";
import { filledSectionsOf } from "../src/lib/resume-content";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FAIL: DATABASE_URL is not set (run `neon deploy` first).");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function cleanupTestRows() {
  await prisma.user.deleteMany({ where: { email: { startsWith: "phase4-" } } });
  await prisma.$executeRawUnsafe(
    `DELETE FROM neon_auth."user" WHERE email LIKE 'phase4-%@example.com'`
  );
}

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

function sampleDocument(title: string) {
  const experience = newExperienceEntry();
  experience.company = "Ridgeview Code Lab";
  experience.role = `${title} intern`;
  experience.location = "Remote";
  experience.startDate = "Jun 2025";
  experience.current = true;
  experience.bullets = [{ id: "b1", text: "Shipped the onboarding revamp" }];

  const education = newEducationEntry();
  education.school = "Ridgeview University";
  education.degree = "BSc";
  education.field = "Computer Science";

  const skill = newSkillEntry();
  skill.name = "TypeScript";

  const project = newProjectEntry();
  project.name = "Bloom";
  project.description = "Plant care tracker";

  const language = newLanguageEntry();
  language.name = "English";
  language.proficiency = "Native";

  const doc = emptyResumeDocument();
  doc.personal.fullName = "Amara Chen";
  doc.personal.email = "phase4-editor@example.com";
  doc.summary = "Frontend-leaning developer.";
  doc.experience = [experience];
  doc.education = [education];
  doc.skills = [skill];
  doc.projects = [project];
  doc.languages = [language];
  return doc;
}

async function main() {
  await cleanupTestRows();
  console.log("Schema guards");
  const doc = sampleDocument("Frontend");
  const parsed = resumeDocumentSchema.safeParse(doc);
  assert(parsed.success, "a realistic document passes validation");
  assert(parseResumeDocument({ nonsense: true }).experience.length === 0, "unreadable JSON falls back to a blank draft");

  const tooLong = newExperienceEntry();
  tooLong.bullets = [{ id: "x", text: "x".repeat(501) }];
  const invalid = emptyResumeDocument();
  invalid.experience = [tooLong];
  assert(!resumeDocumentSchema.safeParse(invalid).success, "over-long bullets are rejected");

  const sections = filledSectionsOf(doc);
  assert(
    sections.join(",") === "Contact,Experience,Education,Skills,Projects",
    `filledSectionsOf reports ${sections.join(",")}`
  );

  console.log("\nPersistence + ownership");
  const stamp = Date.now();
  const email = `phase4-${stamp}@example.com`;
  const password = "Str0ng-E2E-Passw0rd!";
  const jar = cookieJar();

  const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name: "Phase 4 Tester" }),
  });
  jar.add(signup);
  assert(signup.ok, `sign-up returns ${signup.status}`);

  // Hitting the dashboard upserts the app User row for the auth user.
  const firstDashboard = await fetch(`${BASE}/dashboard`, { headers: { cookie: jar.header } });
  const firstHtml = await firstDashboard.text();
  assert(firstDashboard.ok, "dashboard renders for the fresh account");
  assert(
    firstHtml.includes(email),
    "dashboard rendered the signed-in account, not a login redirect"
  );

  const appUser = await prisma.user.findUnique({ where: { email } });
  assert(appUser !== null, "app User row is linked to the auth user");

  const resume = await prisma.resume.create({
    data: {
      userId: appUser!.id,
      title: "Phase 4 target",
      templateId: "classic",
      content: doc as object,
    },
    select: { id: true, title: true, content: true },
  });

  const readBack = await prisma.resume.findFirst({
    where: { id: resume.id, userId: appUser!.id },
  });
  assert(readBack !== null, "resume is readable with the ownership filter");
  assert(
    parseResumeDocument(readBack!.content).experience[0]?.company === "Ridgeview Code Lab",
    "stored content round-trips through the validator"
  );

  const otherUser = await prisma.user.create({
    data: {
      authUserId: `phase4-other-${stamp}`,
      email: `phase4-other-${stamp}@example.com`,
    },
  });
  const otherResume = await prisma.resume.create({
    data: { userId: otherUser.id, title: "Not yours", templateId: "classic", content: doc as object },
    select: { id: true },
  });
  const crossRead = await prisma.resume.findFirst({
    where: { id: resume.id, userId: otherUser.id },
  });
  assert(crossRead === null, "another user cannot read this resume (ownership filter)");

  console.log("\nProtected editor route");
  const ownEditor = await fetch(`${BASE}/resumes/${resume.id}/edit`, {
    headers: { cookie: jar.header },
  });
  const ownHtml = await ownEditor.text();
  assert(ownEditor.ok, `own editor renders (${ownEditor.status})`);
  assert(ownHtml.includes("Phase 4 target"), "editor HTML carries the resume title");
  assert(ownHtml.includes("Live preview"), "editor HTML renders the preview panel");

  const dashboardAfterCreate = await fetch(`${BASE}/dashboard`, { headers: { cookie: jar.header } });
  const dashboardHtml = await dashboardAfterCreate.text();
  assert(dashboardHtml.includes("Phase 4 target"), "dashboard lists the stored resume");

  const crossEditor = await fetch(`${BASE}/resumes/${otherResume.id}/edit`, {
    headers: { cookie: jar.header },
  });
  const crossHtml = await crossEditor.text();
  assert(
    crossEditor.status === 404 || crossHtml.includes("We couldn’t find that page."),
    `cross-user editor is hidden (status ${crossEditor.status})`
  );
  assert(
    !crossHtml.includes("Not yours"),
    "cross-user editor never renders the other user's resume title"
  );

  const anonEditor = await fetch(`${BASE}/resumes/${resume.id}/edit`, { redirect: "manual" });
  assert(
    anonEditor.status >= 300 && anonEditor.status < 400,
    `anonymous editor access redirects (status ${anonEditor.status})`
  );

  console.log("\nCleanup");
  console.log("  (test rows are removed in the finally block)");

  console.log("\nPASS: Phase 4 documents, persistence, ownership, and editor routing work.");
}

main()
  .catch((err) => {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanupTestRows();
      console.log("  ok test users and resumes removed");
    } catch (err) {
      console.error("Cleanup failed:", err);
    } finally {
      await prisma.$disconnect();
    }
  });
