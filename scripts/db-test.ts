// Phase 2 database smoke test: create → read → ownership check → cascade delete.
// Run with:  npx tsx scripts/db-test.ts
// Uses the SAME pooled DATABASE_URL the app uses at runtime.
// Never prints credentials. Exit code 0 = pass.

/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  console.error("FAIL: DATABASE_URL is not set (run `neon deploy` first).");
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

async function main() {
  const stamp = Date.now();

  // 1. Create a user + resume (mirrors app models)
  const user = await prisma.user.create({
    data: {
      authUserId: `test-auth-${stamp}`,
      email: `db-test-${stamp}@example.com`,
      name: "DB Test User",
    },
  });
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: "Smoke test resume",
      content: { summary: "hello" },
    },
  });
  console.log(`  ok create user+resume (id=${resume.id})`);

  // 2. Read back with the same field selection the dashboard uses
  const found = await prisma.resume.findFirst({
    where: { id: resume.id },
    select: { id: true, title: true, templateId: true, userId: true },
  });
  assert(found, "resume is readable via pooled DATABASE_URL");
  assert(found.templateId === "classic", "templateId default is 'classic'");
  assert(found.title === "Smoke test resume", "title round-trips");
  console.log("  ok read back via pooled DATABASE_URL");

  // 3. Ownership check — the server-side pattern: userId is part of the filter
  const otherUser = await prisma.user.create({
    data: {
      authUserId: `test-auth-other-${stamp}`,
      email: `db-test-other-${stamp}@example.com`,
    },
  });
  const crossRead = await prisma.resume.findFirst({
    where: { id: resume.id, userId: otherUser.id },
  });
  assert(crossRead === null, "user B cannot read user A's resume (ownership filter)");

  // 4. Update path
  const renamed = await prisma.resume.update({
    where: { id: resume.id, userId: user.id },
    data: { title: "Smoke test resume v2" },
    select: { title: true },
  });
  assert(renamed.title === "Smoke test resume v2", "update owned resume works");

  // 5. Cascade delete: deleting the user must remove their resume
  await prisma.user.delete({ where: { id: user.id } });
  const afterCascade = await prisma.resume.findFirst({ where: { id: resume.id } });
  assert(afterCascade === null, "resume cascade-deleted with its user");
  await prisma.user.delete({ where: { id: otherUser.id } });

  console.log("\nPASS: Prisma 7 + @prisma/adapter-pg over Neon pooled URL works end to end.");
}

main()
  .catch((err) => {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
