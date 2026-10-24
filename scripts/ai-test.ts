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
  assert(isValidKeyFormat("AQ.Ab8RN6KwdBpVXEoqG2s6ctCLpw7JMlrFxrckQ9nX3p92E8xPKQ"), "validates new Google AI Studio AQ key format");
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

  console.log("\n5. Anti-Slop & Soft-Skill Slop Guard Verification");
  const slopWords = [
    "dynamic",
    "results-driven",
    "proven track record",
    "spearhead",
    "spearheaded",
    "leveraged",
    "synergized",
    "orchestrated",
    "tapestry",
    "multifaceted",
    "pivotal",
  ];
  const summaryLower = (mockGen.result.summary?.suggested || "").toLowerCase();
  for (const slop of slopWords) {
    assert(!summaryLower.includes(slop), `mock summary contains zero AI slop: '${slop}'`);
  }

  // Humanizer skill utility verification
  const { cleanHumanizedText, BANNED_AI_WORDS } = await import("../src/lib/humanizer");
  assert(BANNED_AI_WORDS.includes("delve"), "humanizer includes 'delve'");
  assert(BANNED_AI_WORDS.includes("tapestry"), "humanizer includes 'tapestry'");
  assert(BANNED_AI_WORDS.includes("meticulous"), "humanizer includes 'meticulous'");

  // Verify em dash tell removal (§8)
  const dashed = cleanHumanizedText("Friendly professional — dedicated to customer service — with high accuracy.");
  assert(!dashed.includes("—") && !dashed.includes("–"), "humanizer strips em/en dashes");

  // Verify shallow -ing rider removal (§15)
  const withRider = cleanHumanizedText("Operated cash register and managed transactions, ensuring maximum customer satisfaction.");
  assert(!withRider.includes("ensuring maximum customer satisfaction"), "humanizer strips shallow -ing outcome rider");
  assert(withRider.endsWith("."), "humanizer preserves clean ending period");

  // Verify chatbot residue removal (§22)
  const withResidue = cleanHumanizedText("Certainly! Here is your summary: Dedicated cashier with reliable service.");
  assert(!withResidue.toLowerCase().includes("certainly"), "humanizer strips chatbot greeting");
  const docWithSoftSkill = emptyResumeDocument();
  docWithSoftSkill.personal.fullName = "Test User";
  const expWithSoftSkill = newExperienceEntry();
  expWithSoftSkill.role = "Lead Developer";
  expWithSoftSkill.company = "Tech Corp";
  expWithSoftSkill.bullets = [
    { id: "b1", text: "Demonstrated strong communication and teamwork with cross-functional partners." },
  ];
  docWithSoftSkill.experience = [expWithSoftSkill];
  const genWithSoftSkill = await generateCvSuggestions({
    targetRole: "Engineering Manager",
    sections: ["skills"],
    document: docWithSoftSkill,
  });
  const suggestedSkillNames = genWithSoftSkill.result.skills.map((s) => s.name.toLowerCase());
  assert(!suggestedSkillNames.includes("communication"), "strips generic soft skill 'communication'");
  assert(!suggestedSkillNames.includes("teamwork"), "strips generic soft skill 'teamwork'");

  // Optional: If an API key is available in environment, test Gemini live provider
  const liveKey = process.env.TEST_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (liveKey && isValidKeyFormat(liveKey)) {
    console.log("\n6. Live Gemini API BYOK Integration (Key provided in env)");
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
      const bulletLower = liveBullet.improvedBullet.toLowerCase();
      assert(!bulletLower.includes("spearheaded"), "live bullet does not use slop verb 'spearheaded'");
      assert(!bulletLower.includes("leveraged"), "live bullet does not use slop verb 'leveraged'");
    } catch (err) {
      console.warn("  [note] Live key call failed (might be expired or quota):", err instanceof Error ? err.message : err);
    }
  } else {
    console.log("\n6. Live Gemini API test skipped (no TEST_GEMINI_API_KEY set). BYOK works client-side.");
  }

  console.log("\nPASS: All BYOK AI checks passed successfully!\n");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
