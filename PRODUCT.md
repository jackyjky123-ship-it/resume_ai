# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** Students, recent graduates, and first-time career switchers (e.g. someone applying for their first barista, retail associate, customer service, or junior engineering role) who suffer from blank-page anxiety and do not know how to structure or write bullet points.
- **Secondary:** Active job applicants modernizing an outdated resume who need fast, ATS-compliant A4 PDF exports without monthly subscription fees.

## Product Purpose

Resume AI exists to eliminate blank-page paralysis and paywall exploitation. Commercial builders bait job seekers with "free" editing and hold the PDF download hostage behind \$20–\$30/month recurring subscriptions. Resume AI provides a 100% free, open-source resume builder with instant AI bullet generation, clean multi-page A4 typography, and zero hidden fees.

## Positioning

100% Free & Open Source powered by a Bring-Your-Own-Key (BYOK) Google Gemini architecture. Users plug in a free Google AI Studio key (which requires no credit card and grants 15 RPM for free) to power tailored resume bullet generation and grammar improvement directly in their browser.

## Operating Context

- Used in desktop and laptop web browsers while job hunting, tailoring applications to job postings, and exporting PDFs for job portal uploads.
- The editor features live dual-pane editing with real-time multi-page A4 canvas pagination and instant client-side autosave.

## Capabilities and Constraints

- **Core Capabilities:**
  - Full resume drafting with versioned `ResumeDocument` schema (contact, summary, experience, education, skills, projects, certifications, languages).
  - 6 curated ATS-friendly templates (Template 01 Classic, Template 02 Modern, Template 03 Compact, Template 04 Professional, Template 05 Editorial, Template 06 Designer).
  - Pixel-perfect multi-page A4 pagination with candidate cut-point optimization so content never slices across text lines.
  - Server-side PDF export via `@react-pdf/renderer`.
  - In-browser BYOK Google Gemini integration with local mock AI fallback.
  - Persistent sidebar navigation with 3 routes: `/dashboard`, `/dashboard/templates`, and `/dashboard/api`, plus slide-over settings.
- **Constraints:**
  - Next.js 16 App Router with `cacheComponents: true` and partial prefetching.
  - Server-session isolation: all database mutations and reads are strictly scoped to the authenticated Neon Auth user.
  - Zero server logging or persistent database storage of third-party Gemini API keys.

## Brand Commitments

- **Aesthetic:** Clean, technical minimalism reminiscent of a senior computer science student's personal site or developer tool (restrained typography, high signal-to-noise ratio, crisp borders, subtle monospace accents for data/metrics, zero gimmicky gradients or emoji decorations).
- **Voice:** Direct, honest, encouraging, and unpretentious. Clear software engineering craft without marketing jargon or subscription traps.

## Evidence on Hand

- Verified, working full-stack implementation running Next.js 16.4.2, React 19.3, Prisma 7, Neon Auth, and Tailwind CSS 4.
- Production deployment live on Vercel at `https://resume-ai-one-nu.vercel.app`.
- 100% passing unit tests, DB integration tests, and smoke test suites.

## Product Principles

1. **Zero Exploitation:** No paywalls, no watermark blackmail, no credit card prompts. Always free and open source.
2. **First-Draft Velocity:** Transform a blank page into an interview-worthy draft in under 3 minutes using role-targeted AI bullet suggestions.
3. **Typography & Layout First:** Resumes are read by humans and parsed by ATS scanners. Layout, margins, and page breaks must be mathematically precise.
4. **Transparent Privacy:** The user's Google API key stays in local storage; resumes belong strictly to the user.
