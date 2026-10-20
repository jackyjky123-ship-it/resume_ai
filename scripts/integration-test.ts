// Phase 7 Integration Test Suite
// Exercises:
// 1. Resume CRUD cycle (create, read, update, duplicate, delete) with Prisma
// 2. Strict ownership isolation between multiple user accounts
// 3. Sample data loading and persistence
// 4. Multi-template persistence across all 5 templates
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
import { emptyResumeDocument, type ResumeDocument } from "../src/lib/validations/resume";
import { createSampleResumeDocument } from "../src/lib/sample-data";
import { TEMPLATE_IDS } from "../src/lib/resume-meta";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  console.error("FAIL: DATABASE_URL is not set.");
  process.exit(1);
}

const connectionString = rawConnectionString.replace(/([?&]sslmode=)require\b/, "$1verify-full");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${label}`);
  }
  console.log(`  ok ${label}`);
}

async function cleanupTestRows() {
  await prisma.user.deleteMany({ where: { email: { startsWith: "phase7-" } } });
}

async function main() {
  console.log("=== Phase 7 Integration Test Suite ===");

  try {
    // 1. User setup
    console.log("\n1. Account setup & Database connectivity");
    const userAEmail = `phase7-user-a-${Date.now()}@example.com`;
    const userBEmail = `phase7-user-b-${Date.now()}@example.com`;

    const userA = await prisma.user.create({
      data: {
        email: userAEmail,
        name: "User Alpha",
        authUserId: `auth-phase7-a-${Date.now()}`,
      },
    });
    assert(Boolean(userA.id), "User A created in Postgres");

    const userB = await prisma.user.create({
      data: {
        email: userBEmail,
        name: "User Beta",
        authUserId: `auth-phase7-b-${Date.now()}`,
      },
    });
    assert(Boolean(userB.id), "User B created in Postgres");

    // 2. Resume CRUD cycle
    console.log("\n2. Resume CRUD lifecycle");
    const initialDraft = emptyResumeDocument();
    initialDraft.personal.fullName = "Alice Engineer";

    const created = await prisma.resume.create({
      data: {
        userId: userA.id,
        title: "Alice Cloud Systems Resume",
        templateId: "classic",
        content: initialDraft as unknown as object,
      },
    });
    assert(Boolean(created.id), `Resume created for User A (id: ${created.id})`);
    assert(created.templateId === "classic", "Default template is classic");

    // Read with ownership filter
    const readBack = await prisma.resume.findFirst({
      where: { id: created.id, userId: userA.id },
    });
    assert(readBack !== null, "User A can read own resume");

    // Update with sample data
    console.log("\n3. Update & Sample data persistence");
    const sample = createSampleResumeDocument();
    sample.personal.fullName = "Alice Modified Rivera";

    const updated = await prisma.resume.update({
      where: { id: created.id },
      data: {
        title: "Alice Principal Architect 2026",
        templateId: "editorial",
        content: sample as unknown as object,
      },
    });
    assert(updated.title === "Alice Principal Architect 2026", "Title updated successfully");
    assert(updated.templateId === "editorial", "Template switched to editorial");

    const updatedContent = updated.content as unknown as ResumeDocument;
    assert(updatedContent.personal.fullName === "Alice Modified Rivera", "Sample content persisted to JSONB");
    assert(updatedContent.experience.length >= 3, "Experience entries persisted");

    // Template cycling test across all 5 templates
    console.log("\n4. Template switching across all 5 options");
    for (const t of TEMPLATE_IDS) {
      const switched = await prisma.resume.update({
        where: { id: created.id },
        data: { templateId: t },
      });
      assert(switched.templateId === t, `Template persisted as '${t}'`);
    }

    // Duplication test
    console.log("\n5. Duplication semantics");
    const duplicated = await prisma.resume.create({
      data: {
        userId: userA.id,
        title: `${updated.title} (Copy)`,
        templateId: updated.templateId,
        content: updated.content as object,
      },
    });
    assert(duplicated.id !== created.id, "Duplicated resume receives a fresh ID");
    assert(duplicated.title.includes("(Copy)"), "Duplicated title has copy suffix");

    // 6. Ownership isolation test
    console.log("\n6. Security & Ownership isolation");
    const crossUserRead = await prisma.resume.findFirst({
      where: { id: created.id, userId: userB.id },
    });
    assert(crossUserRead === null, "User B cannot find User A's resume with ownership filter");

    const userBResumes = await prisma.resume.findMany({
      where: { userId: userB.id },
    });
    assert(userBResumes.length === 0, "User B's resume list does not contain User A's documents");

    // 7. Deletion & Cascade
    console.log("\n7. Deletion & Cascade cleanup");
    await prisma.resume.delete({ where: { id: duplicated.id } });
    const checkDeleted = await prisma.resume.findUnique({ where: { id: duplicated.id } });
    assert(checkDeleted === null, "Resume deleted cleanly");

    // Delete user cascades to their resumes
    await prisma.user.delete({ where: { id: userA.id } });
    const checkCascade = await prisma.resume.findUnique({ where: { id: created.id } });
    assert(checkCascade === null, "User deletion cascade-deletes remaining resumes");

    console.log("\nPASS: All Phase 7 integration tests passed successfully!\n");
  } finally {
    await cleanupTestRows();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\nFAIL in integration tests:", err);
  process.exit(1);
});
