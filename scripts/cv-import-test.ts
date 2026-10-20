// CV import route test — needs the app running on :3000 (npm start).
// Run with: npm run cv:import:test
// Creates temporary PDF/DOCX/TXT fixtures, signs in the preview account, and
// exercises PDF, DOCX, TXT, pasted-text, unauthorized, and unsupported uploads.
/* eslint-disable no-console */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { strToU8, zipSync } from "fflate";

const execFileAsync = promisify(execFile);
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const EMAIL = "preview@example.com";
const PASSWORD = "preview-1234";

const SAMPLE_CV = `Amara Chen
Toronto, Canada
amara@example.com | +1 555 010 7788

https://amara.dev | linkedin.com/in/amara | github.com/amara

SUMMARY
Frontend developer with six years of experience shipping accessible products.

EXPERIENCE
Senior Frontend Developer | Northstar Labs | Jan 2022 - Present
- Built a React and TypeScript design system used across four products.
- Improved performance by 40 percent with route-level code splitting.

Product Developer at Brightline | Jun 2019 - Dec 2021
- Delivered a Next.js marketing site and accessible component library.

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
- Reached 2,000 active users in the first year.

CERTIFICATIONS
AWS Certified Cloud Practitioner — Amazon Web Services — 2024

LANGUAGES
English (Native)
Spanish — B2
`;

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${label}`);
  console.log(`  ok ${label}`);
}

async function signIn() {
  let response = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) {
    response = await fetch(`${BASE}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        name: "Amara Chen",
      }),
    });
  }
  assert(response.ok, `signed in the preview account (${response.status})`);
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
}

type ImportOk = {
  ok: true;
  document: {
    personal: { fullName: string; email: string };
    summary: string;
    experience: unknown[];
    skills: unknown[];
  };
  warnings: string[];
  mode: string;
  source: { fileName: string; characters: number };
};

async function importFile(
  cookie: string,
  fileName: string,
  bytes: Uint8Array | string,
  type: string
) {
  const body = new FormData();
  body.append(
    "file",
    new Blob([typeof bytes === "string" ? bytes : new Uint8Array(bytes)], {
      type,
    }),
    fileName
  );
  const response = await fetch(`${BASE}/api/cv/import`, {
    method: "POST",
    headers: { cookie },
    body,
  });
  const payload = (await response.json()) as
    | ImportOk
    | { ok: false; error: string };
  return { response, payload };
}

function assertParsed(
  payload: ImportOk,
  label: string,
  options: { expectSkills?: boolean } = {}
) {
  assert(payload.ok, `${label} returns ok`);
  assert(payload.document.personal.fullName === "Amara Chen", `${label} reads name`);
  assert(
    payload.document.personal.email === "amara@example.com",
    `${label} reads email`
  );
  assert(payload.document.summary.length > 0, `${label} reads summary`);
  assert(
    payload.document.experience.length >= 1,
    `${label} reads experience`
  );
  if (options.expectSkills !== false) {
    assert(payload.document.skills.length >= 2, `${label} reads skills`);
  }
  assert(payload.mode === "mock", `${label} reports demo mode`);
}

function makeDocx() {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Amara Chen</w:t></w:r></w:p>
    <w:p><w:r><w:t>Toronto, Canada</w:t></w:r></w:p>
    <w:p><w:r><w:t>amara@example.com | +1 555 010 7788</w:t></w:r></w:p>
    <w:p><w:r><w:t>SUMMARY</w:t></w:r></w:p>
    <w:p><w:r><w:t>Frontend developer with six years of experience.</w:t></w:r></w:p>
    <w:p><w:r><w:t>EXPERIENCE</w:t></w:r></w:p>
    <w:p><w:r><w:t>Senior Frontend Developer | Northstar Labs | Jan 2022 - Present</w:t></w:r></w:p>
    <w:p><w:r><w:t>- Built a React and TypeScript design system.</w:t></w:r></w:p>
    <w:p><w:r><w:t>EDUCATION</w:t></w:r></w:p>
    <w:p><w:r><w:t>University of Toronto</w:t></w:r></w:p>
    <w:p><w:r><w:t>BSc in Computer Science</w:t></w:r></w:p>
    <w:p><w:r><w:t>SKILLS</w:t></w:r></w:p>
    <w:p><w:r><w:t>TypeScript, React, Next.js</w:t></w:r></w:p>
    <w:p><w:r><w:t>LANGUAGES</w:t></w:r></w:p>
    <w:p><w:r><w:t>English (Native)</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  return zipSync({
    "[Content_Types].xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`),
    "_rels/.rels": strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
    "word/document.xml": strToU8(documentXml),
  });
}

function findEdge() {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function makePdf(directory: string) {
  const edge = findEdge();
  if (!edge) {
    console.log("  (skipping PDF fixture: Microsoft Edge not found)");
    return null;
  }

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
body { font-family: Arial, sans-serif; font-size: 12px; white-space: pre-wrap; }
</style></head><body>${SAMPLE_CV.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</body></html>`;
  const htmlPath = join(directory, "sample-cv.html");
  const pdfPath = join(directory, "sample-cv.pdf");
  await writeFile(htmlPath, html, "utf8");
  await execFileAsync(
    edge,
    [
      "--headless",
      "--disable-gpu",
      `--print-to-pdf=${pdfPath}`,
      `file:///${htmlPath.replace(/\\/g, "/")}`,
    ],
    { timeout: 60_000 }
  );
  return readFile(pdfPath);
}

async function main() {
  const directory = await mkdtemp(join(tmpdir(), "resume-ai-cv-"));
  try {
    const cookie = await signIn();

    console.log("TXT import");
    const txt = await importFile(cookie, "sample-cv.txt", SAMPLE_CV, "text/plain");
    assert(txt.response.ok, `TXT upload accepted (${txt.response.status})`);
    if (txt.payload.ok) assertParsed(txt.payload, "TXT");
    else throw new Error(txt.payload.error);

    console.log("Pasted text import");
    const textBody = new FormData();
    textBody.append("text", SAMPLE_CV);
    const pasted = await fetch(`${BASE}/api/cv/import`, {
      method: "POST",
      headers: { cookie },
      body: textBody,
    });
    const pastedPayload = (await pasted.json()) as ImportOk;
    assert(pasted.ok, `pasted text accepted (${pasted.status})`);
    assertParsed(pastedPayload, "pasted text");

    console.log("DOCX import");
    const docx = await importFile(
      cookie,
      "sample-cv.docx",
      makeDocx(),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    assert(docx.response.ok, `DOCX upload accepted (${docx.response.status})`);
    if (docx.payload.ok) assertParsed(docx.payload, "DOCX");
    else throw new Error(docx.payload.error);

    console.log("PDF import");
    const pdfBytes = await makePdf(directory);
    if (pdfBytes) {
      const pdf = await importFile(cookie, "sample-cv.pdf", pdfBytes, "application/pdf");
      assert(pdf.response.ok, `PDF upload accepted (${pdf.response.status})`);
      if (pdf.payload.ok) {
        assertParsed(pdf.payload, "PDF", { expectSkills: false });
      } else {
        throw new Error(pdf.payload.error);
      }
    }

    console.log("Failure paths");
    const anonymous = await fetch(`${BASE}/api/cv/import`, {
      method: "POST",
      body: new FormData(),
    });
    assert(anonymous.status === 401, "anonymous upload returns 401");

    const unsupported = await importFile(
      cookie,
      "malware.exe",
      "not a cv",
      "application/octet-stream"
    );
    assert(
      unsupported.response.status === 415,
      "unsupported extension returns 415"
    );

    const empty = await importFile(cookie, "empty.txt", "", "text/plain");
    assert(empty.response.status === 422, "empty file returns 422");

    const short = await importFile(cookie, "short.txt", "too short", "text/plain");
    assert(short.response.status === 422, "too little text returns 422");

    console.log("\nPASS: CV import route handles TXT, DOCX, PDF, pasted text, and failure paths.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
