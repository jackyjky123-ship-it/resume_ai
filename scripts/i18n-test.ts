import assert from "node:assert/strict";
import fs from "node:fs";
import { en } from "../src/lib/i18n/en";
import { km } from "../src/lib/i18n/km";

console.log("=== Khmer Language & i18n Verification Suite ===\n");

// 1. Structure and schema parity between EN and KM
console.log("1. Translation Dictionary Parity & Structure");

const sections = [
  "common",
  "nav",
  "sidebar",
  "apiGuide",
  "settings",
  "templatesGallery",
  "emptyState",
  "card",
  "aiDialogs",
  "landing",
  "auth",
  "dashboard",
  "editor",
  "cvTools",
] as const;

for (const section of sections) {
  const enKeys = Object.keys(en[section]);
  const kmKeys = Object.keys(km[section]);

  assert.equal(
    kmKeys.length,
    enKeys.length,
    `Section "${section}" key counts must match (EN: ${enKeys.length}, KM: ${kmKeys.length})`
  );

  for (const key of enKeys) {
    assert.ok(
      key in km[section],
      `Key "${key}" in section "${section}" must exist in Khmer dictionary`
    );
  }
  console.log(`  ok Section "${section}" keys fully mirror between EN and KM (${enKeys.length} keys)`);
}

// 2. Khmer script content validation
console.log("\n2. Khmer Unicode Script Content Validation");
const KHMER_REGEX = /[\u1780-\u17FF]/;

// Verify key Khmer translations have authentic Khmer script
assert.ok(KHMER_REGEX.test(km.common.save), "common.save must contain Khmer script");
assert.ok(KHMER_REGEX.test(km.landing.heroTitle), "landing.heroTitle must contain Khmer script");
assert.ok(KHMER_REGEX.test(km.dashboard.title), "dashboard.title must contain Khmer script");
assert.ok(KHMER_REGEX.test(km.editor.sectionPersonal), "editor.sectionPersonal must contain Khmer script");
assert.ok(KHMER_REGEX.test(km.auth.signInTab), "auth.signInTab must contain Khmer script");
assert.ok(KHMER_REGEX.test(km.cvTools.aiCopilot), "cvTools.aiCopilot must contain Khmer script");
console.log("  ok Khmer dictionary contains authentic Khmer Unicode glyphs (U+1780 - U+17FF)");

// 3. Kantumruy Pro Font Integration Verification
console.log("\n3. Kantumruy Pro Font Integration in Layout & CSS");
const layoutContent = fs.readFileSync("src/app/layout.tsx", "utf8");
const cssContent = fs.readFileSync("src/app/globals.css", "utf8");

assert.ok(
  layoutContent.includes("family=Kantumruy+Pro"),
  "src/app/layout.tsx must contain Google Fonts link for Kantumruy Pro"
);
console.log("  ok Kantumruy Pro stylesheet link registered in layout.tsx");

assert.ok(
  layoutContent.includes("<LanguageProvider>"),
  "src/app/layout.tsx must wrap application in LanguageProvider"
);
console.log("  ok LanguageProvider wired into root layout");

assert.ok(
  cssContent.includes("Kantumruy Pro"),
  "src/app/globals.css must reference 'Kantumruy Pro'"
);
assert.ok(
  cssContent.includes('html[lang="km"]'),
  "src/app/globals.css must have dedicated html[lang=\"km\"] typography styles"
);
console.log("  ok globals.css defines Kantumruy Pro fallback and html[lang=\"km\"] typography rules");

console.log("\nPASS: All Khmer language and font tests passed successfully!\n");
