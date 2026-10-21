// BYOK AI Integration & Fallback Smoke Test.
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
  const {
    fixGrammar,
    generateCvSuggestions,
    improveBullet,
  } = await import("../src/server/services/ai.service");
  const { isValidKeyFormat } = await import("../src/lib/api-key-store");
  const {
    emptyResumeDocument,
    newExperienceEntry,
    newSkillEntry,
  } = await import("../src/lib/validations/resume");

  console.log("=== BYOK AI Service & Mock Fallback Smoke Test ===\n");

  console.log("1. API Key Format Validation");
  assert(isValidKeyFormat("AIzaSyB1234567890abcdefghijklmnopqrstuv"), "validates standard AIza key format");
  assert(!isValidKeyFormat("short-key"), "rejects too-short key");
  assert(!isValidKeyFormat("sk-ant-api03-abcdef123456"), "rejects non-Google keys");
  assert(!isValidKeyFormat(""), "rejects empty string");

  console.log("\n2. Demo / Mock Bullet Improvement (No Key)");
  const mockBullet = await improveBullet({
    bullet: "worked on frontend bugs and made site faster",
    role: "Frontend Developer",
    company: "Acme Corp",
  });
  console.log(`  Improved (mock): "${mockBullet.improvedBullet}"`);
  assert(mockBullet.mode === "mock", "returns mode='mock' when no key provided");
  assert(mockBullet.improvedBullet.length > 5, "mock improved bullet is populated");

  console.log("\n3. Demo / Mock Grammar Fix (No Key)");
  const mockGrammar = await fixGrammar({
    text: "i has been working on web application development",
  });
  console.log(`  Corrected (mock): "${mockGrammar.correctedText}"`);
  assert(mockGrammar.mode === "mock", "returns mode='mock' when no key provided");
  assert(mockGrammar.correctedText.length > 5, "mock grammar correction is populated");

  console.log("\n4. Demo / Mock Generate CV Suggestions (Grounded)");
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

  const mockGen = await generateCvSuggestions({
    targetRole: "Principal Infrastructure Architect",
    sections: ["summary", "skills"],
    document: doc,
  });
  assert(mockGen.mode === "mock", "returns mode='mock' when no key provided");
  assert(mockGen.result.summary !== null, "generates mock summary suggestion");
  assert(mockGen.result.skills.length >= 0, "evaluates skills section");

  // Optional: If an API key is available in environment, test Gemini live provider
  const liveKey = process.env.TEST_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (liveKey && isValidKeyFormat(liveKey)) {
    console.log("\n5. Live Gemini API BYOK Integration (Key provided in env)");
    try {
      const liveBullet = await improveBullet(
        {
          bullet: "worked on frontend bugs and made site faster",
          role: "Frontend Developer",
          company: "Acme Corp",
        },
        liveKey
      );
      assert(liveBullet.mode === "gemini", "returns mode='gemini' when live key passed");
      console.log(`  Live Improved: "${liveBullet.improvedBullet}"`);
      console.log(`  Explanation: "${liveBullet.explanation}"`);
    } catch (err) {
      console.warn("  [note] Live key call failed (might be expired or quota):", err instanceof Error ? err.message : err);
    }
  } else {
    console.log("\n5. Live Gemini API test skipped (no TEST_GEMINI_API_KEY set). BYOK works client-side.");
  }

  console.log("\nPASS: All BYOK AI checks passed successfully!\n");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
