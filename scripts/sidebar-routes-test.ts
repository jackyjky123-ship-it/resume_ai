// Smoke test for the 3 routes: /dashboard, /dashboard/templates, and /dashboard/api
/* eslint-disable no-console */
export {};

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EMAIL = "preview@example.com";
const PASSWORD = "preview-1234";

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

async function main() {
  console.log("=== Testing 3 Dashboard Routes & Sidebar ===");

  // 1. Authenticate
  const authRes = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  assert(authRes.ok, "authenticated with preview account");

  const cookie = authRes.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
  assert(cookie.length > 0, "session cookie obtained");

  // 2. Test /dashboard
  console.log("\n1. Testing /dashboard");
  const dashRes = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  const dashHtml = await dashRes.text();
  assert(dashRes.ok, "HTTP 200 on /dashboard");
  assert(dashHtml.includes("Dashboard Overview"), "renders Dashboard Overview title");
  assert(dashHtml.includes("Usage Statistics"), "renders Usage Statistics (static use)");
  assert(dashHtml.includes("See All Data"), "renders See All Data section");
  assert(dashHtml.includes("Create New CV"), "renders Create New CV button");
  assert(dashHtml.includes("Main Menu"), "renders Sidebar navigation");
  assert(dashHtml.includes("Settings"), "renders Settings button in sidebar");

  // 3. Test /dashboard/templates
  console.log("\n2. Testing /dashboard/templates");
  const tmplRes = await fetch(`${BASE}/dashboard/templates`, { headers: { cookie } });
  const tmplHtml = await tmplRes.text();
  assert(tmplRes.ok, "HTTP 200 on /dashboard/templates");
  assert(tmplHtml.includes("Template Gallery"), "renders Template Gallery title");
  assert(tmplHtml.includes("Template 01"), "renders Template 01 label");
  assert(tmplHtml.includes("Template 02"), "renders Template 02 label");
  assert(tmplHtml.includes("Template 03"), "renders Template 03 label");
  assert(tmplHtml.includes("Template 04"), "renders Template 04 label");
  assert(tmplHtml.includes("Template 05"), "renders Template 05 label");
  assert(tmplHtml.includes("Template 06"), "renders Template 06 label");
  assert(tmplHtml.includes("Recommended"), "renders Recommended badges");
  assert(tmplHtml.includes("Use Template 01") || tmplHtml.includes("Use Template 05"), "renders Use Template action");

  // 4. Test /dashboard/api
  console.log("\n3. Testing /dashboard/api");
  const apiRes = await fetch(`${BASE}/dashboard/api`, { headers: { cookie } });
  const apiHtml = await apiRes.text();
  assert(apiRes.ok, "HTTP 200 on /dashboard/api");
  assert(apiHtml.includes("Google Gemini API Guide"), "renders Google Gemini API Guide title");
  assert(apiHtml.includes("Open Google AI Studio") || apiHtml.includes("Open AI Studio"), "renders Step 1 AI Studio link");
  assert(apiHtml.includes("Create an API Key"), "renders Step 2 Create Key guide");
  assert(apiHtml.includes("Enter Your Gemini API Key"), "renders Step 3 Key input box");
  assert(apiHtml.includes("Test Connection"), "renders Test Connection button");

  console.log("\nPASS: All 3 routes and sidebar verified successfully!");
}

main().catch((err) => {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
