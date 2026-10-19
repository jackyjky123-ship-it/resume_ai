// Dashboard smoke test — needs the app running on :3000 (npm start).
// Run with:  npm run dashboard:test
// Signs in a reusable preview account (creating it once if needed), then
// asserts the protected dashboard renders the real workspace UI behind a
// session. The preview account is intentionally NOT deleted, so you can sign
// in with it in the browser: preview@example.com / preview-1234
/* eslint-disable no-console */

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EMAIL = "preview@example.com";
const PASSWORD = "preview-1234";

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

function post(path: string, body: unknown) {
  return fetch(`${BASE}/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function main() {
  let res = await post("sign-in/email", { email: EMAIL, password: PASSWORD });
  if (!res.ok) {
    console.log(`  (sign-in returned ${res.status}; creating the preview account)`);
    res = await post("sign-up/email", { email: EMAIL, password: PASSWORD, name: "Amara Chen" });
  }
  assert(res.ok, `auth accepted the preview account (${res.status})`);
  const cookie = res.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert(cookie.length > 0, "session cookie issued");

  const dashboard = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  const html = await dashboard.text();
  assert(dashboard.ok, `dashboard renders for ${EMAIL} (${dashboard.status})`);
  assert(html.includes(EMAIL), "top bar + profile header show the session email");
  assert(html.includes("Amara Chen"), "profile header shows the session name");
  assert(html.includes("New resume"), "create action renders");
  assert(
    html.includes('aria-label="Your resumes"') || html.includes("Your first resume starts here."),
    "resume list section renders (empty or populated)"
  );
  assert(html.includes("Private to your account"), "real-data footnote renders");
  assert(
    !html.includes("Design preview"),
    "old mock-data footnote is gone"
  );

  console.log(`\nPASS: the dashboard UI renders behind a real session.`);
  console.log(`Sign in in the browser with: ${EMAIL} / ${PASSWORD}`);
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
