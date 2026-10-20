// CV tools browser test — needs the app running on :3000 (npm start).
// Run with: npm run cv:ui:test
// Signs in through the UI, imports pasted CV text, applies grounded
// suggestions, waits for autosave, and checks for hydration/console errors.
/* eslint-disable no-console */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadEnv } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";
import { emptyResumeDocument } from "../src/lib/validations/resume";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EMAIL = "preview@example.com";
const PASSWORD = "preview-1234";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FAIL: DATABASE_URL is not set (run `neon deploy` first).");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const SAMPLE_CV = `Amara Chen
Toronto, Canada
amara@example.com | +1 555 010 7788

SUMMARY
Frontend developer with six years of experience shipping accessible products.

EXPERIENCE
Senior Frontend Developer | Northstar Labs | Jan 2022 - Present
- Built a React and TypeScript design system used across four products.
- Improved performance by 40 percent with route-level code splitting.

EDUCATION
University of Toronto
BSc in Computer Science
2015 - 2019

SKILLS
TypeScript, React, Next.js, Accessibility

PROJECTS
Bloom — plant care tracker
A React app that helps people keep houseplants alive.
- Built a scheduling engine with notifications.

LANGUAGES
English (Native)
`;

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findEdge() {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

type EvaluateResult = {
  result?: { value?: unknown; description?: string };
  exceptionDetails?: { text?: string; exception?: { description?: string } };
};

class CdpClient {
  private socket: WebSocket;
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  private listeners = new Map<string, Array<(params: unknown) => void>>();

  private constructor(socket: WebSocket) {
    this.socket = socket;
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as {
        id?: number;
        method?: string;
        params?: unknown;
        result?: unknown;
        error?: { message?: string };
      };
      if (typeof message.id === "number") {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      if (message.method) {
        for (const listener of this.listeners.get(message.method) ?? []) {
          listener(message.params);
        }
      }
    });
  }

  static async connect(url: string) {
    const socket = new WebSocket(url);
    await new Promise<void>((resolve, reject) => {
      socket.addEventListener("open", () => resolve(), { once: true });
      socket.addEventListener(
        "error",
        () => reject(new Error("CDP WebSocket failed to connect")),
        { once: true }
      );
    });
    return new CdpClient(socket);
  }

  on(method: string, listener: (params: unknown) => void) {
    const current = this.listeners.get(method) ?? [];
    current.push(listener);
    this.listeners.set(method, current);
  }

  send<T = Record<string, unknown>>(
    method: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
      });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression: string) {
    const result = await this.send<EvaluateResult>("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text ??
          "Browser evaluation failed"
      );
    }
    return result.result?.value;
  }

  async waitFor(expression: string, label: string, timeout = 20_000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        if (await this.evaluate(expression)) return;
      } catch {
        // Navigation can destroy the execution context; retry until ready.
      }
      await delay(150);
    }
    throw new Error(`Timed out waiting for ${label}`);
  }

  async clickByText(text: string) {
    const clicked = await this.evaluate(
      `(() => {
        const target = ${JSON.stringify(text)};
        const button = [...document.querySelectorAll("button")].find(
          (element) => element.textContent?.replace(/\\s+/g, " ").trim() === target
        );
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    assert(clicked === true, `clicked "${text}"`);
  }

  async setValue(selector: string, value: string) {
    const updated = await this.evaluate(
      `(() => {
        const element = document.querySelector(${JSON.stringify(selector)});
        if (!element) return false;
        const prototype =
          element instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
        setter?.call(element, ${JSON.stringify(value)});
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      })()`
    );
    assert(updated === true, `filled ${selector}`);
  }

  async valueOf(selector: string) {
    return (await this.evaluate(
      `document.querySelector(${JSON.stringify(selector)})?.value ?? null`
    )) as string | null;
  }

  async text() {
    return (await this.evaluate("document.body.innerText")) as string;
  }

  async screenshot(path: string) {
    const result = await this.send<{ data: string }>("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(path, Buffer.from(result.data, "base64"));
  }
}

async function waitForEndpoint(url: string, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Browser is still starting.
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  let resumeId: string | null = null;
  let browser: ReturnType<typeof spawn> | null = null;
  let userDataDir: string | null = null;
  let client: CdpClient | null = null;

  try {
    // Ensure the preview account has an app User row, then create a disposable
    // resume for this test.
    let authResponse = await fetch(`${BASE}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (!authResponse.ok) {
      authResponse = await fetch(`${BASE}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: EMAIL,
          password: PASSWORD,
          name: "Amara Chen",
        }),
      });
    }
    assert(authResponse.ok, `preview account available (${authResponse.status})`);

    const cookie = authResponse.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    const dashboardResponse = await fetch(`${BASE}/dashboard`, {
      headers: { cookie },
    });
    assert(dashboardResponse.ok, "dashboard loads for the preview account");

    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    assert(user, "app user exists after the dashboard request");
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: "CV tools test",
        templateId: "classic",
        content: emptyResumeDocument(),
      },
    });
    resumeId = resume.id;

    const edge = findEdge();
    assert(edge, "Microsoft Edge is available");
    userDataDir = await mkdtemp(join(tmpdir(), "resume-ai-edge-"));
    const port = 9400 + Math.floor(Math.random() * 200);
    browser = spawn(
      edge,
      [
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${userDataDir}`,
        "--window-size=1440,1000",
        "about:blank",
      ],
      { stdio: "ignore" }
    );

    await waitForEndpoint(`http://127.0.0.1:${port}/json/version`);
    const targetResponse = await fetch(
      `http://127.0.0.1:${port}/json/new?about:blank`,
      { method: "PUT" }
    );
    const target = (await targetResponse.json()) as {
      webSocketDebuggerUrl: string;
    };
    client = await CdpClient.connect(target.webSocketDebuggerUrl);

    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `(() => {
        window.__cvTestErrors = [];
        const originalError = console.error;
        console.error = (...args) => {
          const text = args
            .map((value) => {
              try {
                return typeof value === "string" ? value : JSON.stringify(value);
              } catch {
                return String(value);
              }
            })
            .join(" ");
          window.__cvTestErrors.push(text);
          originalError(...args);
        };
        window.addEventListener("error", (event) => {
          window.__cvTestErrors.push("window.error: " + (event.message || String(event.error)));
        });
        window.addEventListener("unhandledrejection", (event) => {
          window.__cvTestErrors.push("unhandledrejection: " + String(event.reason));
        });
      })();`,
    });

    console.log("Browser sign-in");
    await client.send("Page.navigate", { url: `${BASE}/login` });
    await client.waitFor(
      "document.querySelector('input[type=email]') !== null",
      "login form"
    );
    await delay(1_000);
    await client.setValue('input[type="email"]', EMAIL);
    await client.setValue('input[type="password"]', PASSWORD);
    await client.clickByText("Sign in");
    try {
      await client.waitFor(
        "window.location.pathname === '/dashboard'",
        "dashboard redirect",
        20_000
      );
    } catch (error) {
      console.log("  login page after submit:");
      console.log(
        (await client.text())
          .split("\n")
          .filter(Boolean)
          .slice(0, 20)
          .map((line) => `    ${line}`)
          .join("\n")
      );
      await client.screenshot(join(tmpdir(), "resumeai-cv-login-failure.png"));
      throw error;
    }
    assert(true, "signed in through the login form");

    console.log("Editor + Update CV");
    await client.send("Page.navigate", {
      url: `${BASE}/resumes/${resumeId}/edit`,
    });
    await client.waitFor(
      `document.body.innerText.includes("Update CV")`,
      "editor tools",
      30_000
    );
    const toolsText = await client.text();
    assert(toolsText.includes("Generate CV"), "editor shows both CV tool buttons");
    assert(toolsText.includes("Demo AI"), "editor labels demo AI mode");

    await client.clickByText("Update CV");
    await client.waitFor(
      `document.body.innerText.includes("Update CV from an existing file")`,
      "import dialog"
    );
    await client.screenshot(join(tmpdir(), "resumeai-cv-import-1.png"));

    await client.setValue("#cv-text", SAMPLE_CV);
    await client.clickByText("Read CV");
    await client.waitFor(
      `document.body.innerText.includes("Apply imported CV")`,
      "import preview",
      30_000
    );
    assert(
      (await client.text()).includes("Amara Chen"),
      "import preview renders the parsed name"
    );
    await client.screenshot(join(tmpdir(), "resumeai-cv-import-2.png"));

    await client.clickByText("Apply imported CV");
    await client.waitFor(
      `!document.body.innerText.includes("Apply imported CV")`,
      "import dialog close"
    );
    await client.waitFor(
      `document.querySelector('input[name="content.personal.fullName"]')?.value === "Amara Chen"`,
      "imported name in the editor"
    );
    assert(true, "imported content populates the form");

    await delay(3_000);
    const savedAfterImport = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    assert(
      JSON.stringify(savedAfterImport?.content).includes("Amara Chen"),
      "import autosaves to the database"
    );

    console.log("Generate CV");
    await client.clickByText("Generate CV");
    await client.waitFor(
      `document.body.innerText.includes("Generate CV suggestions")`,
      "generate dialog"
    );
    await client.setValue("#target-role", "Staff Frontend Engineer");
    await client.clickByText("Generate suggestions");
    await client.waitFor(
      `document.body.innerText.includes("Suggestions for Staff Frontend Engineer")`,
      "suggestion results",
      30_000
    );
    const suggestionsText = await client.text();
    assert(
      suggestionsText.includes("Demo suggestions"),
      "results clearly identify demo mode"
    );
    assert(
      suggestionsText.includes("Staff Frontend Engineer"),
      "summary suggestion uses the target role"
    );
    await client.screenshot(join(tmpdir(), "resumeai-cv-generate-1.png"));

    const skillInputsBefore = (await client.evaluate(
      `document.querySelectorAll('input[name^="content.skills."]').length`
    )) as number;

    await client.clickByText("Use this suggestion");
    await client.waitFor(
      `document.querySelector('textarea[name="content.summary"]')?.value.includes("Staff Frontend Engineer")`,
      "summary applied to the form"
    );
    assert(true, "accepting the summary updates the editor");

    const addSkillsClicked = await client.evaluate(
      `(() => {
        const button = [...document.querySelectorAll("button")].find(
          (element) => /^Add \\d+ skills?$/.test(element.textContent?.trim() ?? "")
        );
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    assert(addSkillsClicked === true, "skills suggestion has an accept action");
    await client.waitFor(
      `document.querySelectorAll('input[name^="content.skills."]').length > ${skillInputsBefore}`,
      "skills added to the form"
    );
    assert(true, "accepting skills updates the editor");

    const projectClicked = await client.evaluate(
      `(() => {
        const button = [...document.querySelectorAll("button")].find(
          (element) => element.textContent?.trim() === "Use these highlights"
        );
        if (!button) return false;
        button.click();
        return true;
      })()`
    );
    assert(projectClicked === true, "project highlight suggestion has an accept action");

    await client.clickByText("Done");
    await delay(3_000);
    const savedFinal = await prisma.resume.findUnique({
      where: { id: resumeId },
    });
    const finalContent = JSON.stringify(savedFinal?.content);
    const finalSkills =
      (savedFinal?.content as { skills?: unknown[] } | null)?.skills?.length ??
      0;
    assert(
      finalContent.includes("Staff Frontend Engineer"),
      "accepted summary autosaves"
    );
    assert(finalSkills > skillInputsBefore, "accepted skills autosave");

    const errors = (await client.evaluate(
      "window.__cvTestErrors ?? []"
    )) as string[];
    if (errors.length > 0) {
      console.log("  browser console errors:");
      for (const error of errors) console.log(`    - ${error.slice(0, 500)}`);
    }
    assert(errors.length === 0, "no hydration or console errors");

    console.log("\nPASS: CV tools work in the browser and autosave.");
  } finally {
    if (resumeId) {
      await prisma.resume.delete({ where: { id: resumeId } }).catch(() => {});
    }
    await prisma.$disconnect();
    if (client) {
      await client.send("Browser.close").catch(() => {});
    }
    if (browser) {
      browser.kill();
      await delay(500);
    }
    if (userDataDir) {
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
