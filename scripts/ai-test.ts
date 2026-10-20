// Phase 5 AI integration test.
// Run with: npx tsx scripts/ai-test.ts
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

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

async function run() {
  const { prisma } = await import("../src/lib/prisma");
  const {
    fixGrammar,
    generateCvSuggestions,
    getAiMode,
    improveBullet,
  } = await import("../src/server/services/ai.service");
  const {
    checkAiQuota,
    countTodayUsage,
    recordAiUsage,
  } = await import("../src/server/services/ai-quota.service");
  const {
    emptyResumeDocument,
    newExperienceEntry,
    newSkillEntry,
  } = await import("../src/lib/validations/resume");

  console.log("AI Mode Detection");
  const mode = getAiMode();
  console.log(`  Active AI mode: ${mode}`);
  assert(mode === "gemini", "detects gemini mode when GEMINI_API_KEY is configured");

  console.log("\nAI Quota Service");
  // Create or get a test user for quota testing
  let testUser = await prisma.user.findFirst({
    where: { email: "ai-test@example.com" },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        authUserId: `ai-test-${Date.now()}`,
        email: "ai-test@example.com",
        name: "AI Test User",
      },
    });
  }

  const initialCount = await countTodayUsage(testUser.id);
  console.log(`  Initial today usage for test user: ${initialCount}`);

  await recordAiUsage(testUser.id, "test_action");
  const updatedCount = await countTodayUsage(testUser.id);
  assert(updatedCount === initialCount + 1, "recordAiUsage increments today's usage count");

  const quota = await checkAiQuota(testUser.id);
  assert(quota.used === updatedCount, "checkAiQuota reports correct used count");
  assert(quota.limit === 10, "checkAiQuota reports 10 as daily limit");
  assert(quota.remaining === Math.max(0, 10 - updatedCount), "checkAiQuota calculates remaining correctly");

  console.log("\nGemini Bullet Improvement");
  const bulletResult = await improveBullet({
    bullet: "worked on frontend bugs and made site faster",
    role: "Frontend Developer",
    company: "Acme Corp",
  });
  console.log(`  Original: "worked on frontend bugs and made site faster"`);
  console.log(`  Improved: "${bulletResult.improvedBullet}"`);
  console.log(`  Reason: "${bulletResult.explanation}"`);
  assert(bulletResult.improvedBullet.length > 10, "returns improved bullet text");
  assert(bulletResult.mode === "gemini", "reports gemini mode in result");

  console.log("\nGemini Grammar Fix");
  const grammarResult = await fixGrammar({
    text: "I has been working on web application development since 3 years and likes building ui.",
  });
  console.log(`  Original: "I has been working on web application development since 3 years and likes building ui."`);
  console.log(`  Corrected: "${grammarResult.correctedText}"`);
  assert(grammarResult.correctedText.length > 10, "returns corrected text");
  assert(grammarResult.mode === "gemini", "reports gemini mode in result");

  console.log("\nGemini Generate CV Suggestions (Grounded)");
  const doc = emptyResumeDocument();
  doc.personal.fullName = "Sarah Connor";
  doc.summary = "Experienced software engineer specializing in distributed systems and cloud infrastructure.";
  const exp = newExperienceEntry();
  exp.role = "Senior Cloud Engineer";
  exp.company = "Cyberdyne Systems";
  exp.startDate = "Jan 2021";
  exp.current = true;
  exp.bullets = [
    { id: "b1", text: "Architected Kubernetes clusters across AWS and GCP multi-region environments." },
    { id: "b2", text: "Reduced latency by 45% using Redis caching and message queues." },
  ];
  doc.experience = [exp];
  const skill1 = newSkillEntry();
  skill1.name = "Kubernetes";
  const skill2 = newSkillEntry();
  skill2.name = "Go";
  doc.skills = [skill1, skill2];

  const genResult = await generateCvSuggestions({
    targetRole: "Principal Infrastructure Architect",
    sections: ["summary", "skills"],
    document: doc,
  });

  console.log(`  Generated Summary: "${genResult.result.summary?.suggested}"`);
  assert(genResult.result.summary !== null, "generates summary suggestion");
  assert(genResult.mode === "gemini", "reports gemini mode");
  console.log(`  Grounded Skills:`, genResult.result.skills.map((s) => s.name));
  assert(
    genResult.result.skills.every((s) =>
      ["kubernetes", "aws", "gcp", "redis", "cloud", "go"].some((allowed) =>
        s.name.toLowerCase().includes(allowed)
      )
    ),
    "suggested skills are strictly grounded in existing resume facts"
  );

  // Clean up test user
  await prisma.aIUsage.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log("  Cleaned up test user data.");

  console.log("\nAll Phase 5 AI checks passed successfully!");

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
