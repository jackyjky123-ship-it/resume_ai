// Neon Auth end-to-end test against the running app (npm start on :3000).
// Run with:  npx tsx scripts/auth-test.ts
// Exercises: sign-up → session cookie → protected page → sign-out.
// Cleans up the test user from the neon_auth schema afterwards. Never prints secrets.

/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${label}`);
  }
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

async function main() {
  const stamp = Date.now();
  const email = `e2e-${stamp}@example.com`;
  const password = "Str0ng-E2E-Passw0rd!";
  const jar = cookieJar();

  // 1. Sign-up through the app's same-origin proxy → Managed Better Auth
  const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, name: "E2E User" }),
  });
  jar.add(signup);
  const signupBody = (await signup.json()) as { user?: { email?: string } };
  // Raw Better Auth REST responses are bare ({ token, user }); the { data, error }
  // wrapper exists only in the client SDK.
  assert(signup.ok, `sign-up returns ${signup.status}`);
  assert(signupBody.user?.email === email, "signed-up user round-trips via proxy");

  // 2. Session via the cookie, still through the app proxy
  const session = await fetch(`${BASE}/api/auth/get-session`, {
    headers: { cookie: jar.header },
  });
  const sessionBody = (await session.json()) as { user?: { email?: string } } | null;
  assert(sessionBody?.user?.email === email, "get-session returns the signed-up user");

  // 3. Protected page: without cookie the proxy must redirect to /login
  const anonDashboard = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  assert(
    anonDashboard.status >= 300 && anonDashboard.status < 400,
    `/dashboard blocks anonymous access (status ${anonDashboard.status})`
  );

  // 4. Protected page with cookie must render the streaming user badge
  const authedDashboard = await fetch(`${BASE}/dashboard`, { headers: { cookie: jar.header } });
  const html = await authedDashboard.text();
  assert(authedDashboard.ok, `dashboard renders for the signed-in user (status ${authedDashboard.status})`);
  assert(html.includes(email), "dashboard HTML contains the session email");

  // 5. Sign-out ends the browser session
  const signout = await fetch(`${BASE}/api/auth/sign-out`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: jar.header },
    body: "{}",
  });
  jar.add(signout);
  assert(signout.ok, `sign-out returns ${signout.status}`);
  const after = await fetch(`${BASE}/api/auth/get-session`, { headers: { cookie: jar.header } });
  const afterBody = (await after.json()) as { user?: unknown } | null;
  assert(afterBody?.user === undefined, "session is gone after sign-out");
  const afterDashboard = await fetch(`${BASE}/dashboard`, {
    headers: { cookie: jar.header },
    redirect: "manual",
  });
  assert(
    afterDashboard.status >= 300 && afterDashboard.status < 400,
    `/dashboard redirects again after sign-out (status ${afterDashboard.status})`
  );

  // 6. Cleanup: remove the test users from the neon_auth schema
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  try {
    const deleted = await prisma.$executeRawUnsafe(
      `DELETE FROM neon_auth."user" WHERE email LIKE 'e2e-%@example.com' OR email LIKE 'probe-%@example.com'`
    );
    console.log(`  ok cleaned up test auth users (${deleted} rows deleted)`);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nPASS: Neon Auth works end to end through the Next.js app.");
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
