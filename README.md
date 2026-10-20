# ResumeAI — Full-Stack AI Resume Builder

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9_strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=neon)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://resume-ai-one-nu.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Demo:** [https://resume-ai-one-nu.vercel.app](https://resume-ai-one-nu.vercel.app)  
> Built as a production-grade, portfolio-ready full-stack web application demonstrating modern web engineering, server-side data isolation, resilient architecture, and zero-cost free-tier operation.

---

## 1. Overview

**ResumeAI** helps students, job seekers, and engineers build clean, modern resumes without paywalls, watermark extortion, or forced subscriptions. Users edit structured sections, preview multiple A4 templates in real time, leverage focused AI suggestions with human review, and export publication-ready PDFs.

### Core Philosophy
1. **Always Free & Watermark-Free**: Every template and PDF export is 100% free with selectable text and standard A4 dimensions.
2. **AI with Human-in-the-Loop**: AI suggestions are presented side-by-side with original text; users explicitly **accept** or **reject** changes. Content is never rewritten silently.
3. **Fault-Tolerant Core Editing**: Manual editing, autosave, and PDF downloads remain 100% operational even if the AI provider experiences outages or rate limits.
4. **Privacy-by-Design**: AI requests only receive the minimum payload needed for the active edit (e.g. a single bullet point or summary draft). User resumes are **never** used to train AI models.

---

## 2. Architecture & Tech Stack

```mermaid
flowchart TD
    Client["Browser Client (React 19, RHF, Zod)"]
    Proxy["Next.js Proxy (Route Guard / Middleware)"]
    NextApp["Next.js App Router (Server Components & Actions)"]
    NeonAuth["Neon Auth (Managed Better Auth)"]
    Postgres[("Neon PostgreSQL (Database)")]
    PrismaAdapter["Prisma 7 + @prisma/adapter-pg"]
    GeminiAPI["Google Gemini API (AI Suggestions)"]
    ReactPDF["@react-pdf/renderer (Serverless PDF)"]

    Client -->|Protected Navigation| Proxy
    Proxy -->|Pass / Reject| NextApp
    Client -->|Auth / Session Token| NeonAuth
    NextApp -->|Verify Session & Upsert User| NeonAuth
    NextApp -->|Typed Queries & Mutations| PrismaAdapter
    PrismaAdapter -->|Pooled Connection / SSL verify-full| Postgres
    NextApp -->|Structured AI Actions (Zod-guarded)| GeminiAPI
    NextApp -->|Stream A4 Binary| ReactPDF
    ReactPDF -->|PDF Download| Client
```

### Technology Highlights
- **Framework**: Next.js 16.4.2 (App Router with Turbopack, Partial Prerendering, and Cache Components).
- **Frontend**: React 19.3, React Hook Form 7.90, Zod 4.6, Lucide Icons, and custom CSS-token design system.
- **Data Access & Storage**: Prisma 7.10.1 utilizing the official PostgreSQL driver adapter (`@prisma/adapter-pg`) over Neon serverless pooled connection strings (`DATABASE_URL`) with unpooled migrations (`DATABASE_URL_UNPOOLED`).
- **Authentication**: Neon Auth (Managed Better Auth) in the `neon_auth` schema, lazily synchronizing application users via `authUserId`.
- **AI Processing**: Google Gemini API behind an isolated provider abstraction (`ai.service.ts`) with per-user daily quota tracking and structured schema outputs.
- **PDF Generation**: Server-rendered `@react-pdf/renderer` delivering clean A4 documents across 5 curated templates.

---

## 3. Database Schema

The database schema is defined in `prisma/schema.prisma` and deployed to Neon PostgreSQL:

```prisma
model User {
  id         String    @id @default(cuid())
  authUserId String    @unique // Managed Better Auth ID
  email      String    @unique
  name       String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  resumes    Resume[]
  aiUsages   AIUsage[]
}

model Resume {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title      String
  templateId String    @default("classic")
  content    Json      // Versioned ResumeDocument v1
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([userId])
  @@index([userId, updatedAt])
}

model AIUsage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  action    String   // improve-bullet, tailor-job, fix-grammar, cv-import
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 4. Key Features

### 📄 Structured Resume Editor
- **Full MVP Sections**: Contact Details, Professional Summary, Work Experience, Education, Skills, Projects, Certifications, and Languages.
- **Stable-ID Arrays**: Dynamic repeatable entries (experience, bullets, projects) maintain stable cryptographic IDs to eliminate UI state tearing during reordering or deletion.
- **Debounced Autosave**: Automatic 1.2-second debounce with in-flight queue protection, `beforeunload` unsaved-state protection, and granular save indicators.
- **Sample Data Generator**: Instant one-click demo population for rapid template evaluation.

### 🎨 5 Curated Templates
- **Classic**: The gold-standard single-column layout preferred by corporate ATS systems and traditional recruiters.
- **Modern**: Clean contemporary typography with subtle Instagram-inspired gradient accent bar.
- **Compact**: Dense, high-information-density two-column layout ideal for experienced candidates and lengthy career histories.
- **Professional**: Executive layout featuring a high-contrast dark banner header and clean section dividers.
- **Editorial**: Distinctive split-column format with dedicated profile thumbnail frame and dashed skill grid.

### 🤖 Grounded AI Assistance
- **Bullet Point Refinement**: Rewrites experience bullets following the XYZ format (*Accomplished [X] as measured by [Y] by doing [Z]*).
- **Summary Proofreading & Tone Tuning**: Enhances executive summaries for impact and conciseness.
- **Job Description Tailoring**: Identifies missing keywords and generates targeted bullet suggestions.
- **AI-Enhanced Raw CV Import**: Parses raw text or unstructured CV pastes into valid `ResumeDocument` structures.
- **Strict Anti-Hallucination Guardrails**: Prompts enforce grounding on user facts—AI is forbidden from inventing metrics, employers, or credentials.
- **Per-User Quotas**: Tracks daily requests in PostgreSQL to maintain zero-cost operation and prevent abuse.

### 🖨️ Production PDF Engine
- Server-rendered via authenticated endpoint `/api/resumes/[resumeId]/pdf`.
- Full A4 page math (`595.28pt` x `841.89pt`) with exact printable margins.
- Proper hyphenation and page-break rules avoiding orphan headings.
- Sanitized filename downloads based on applicant name (`Amara_Chen_Resume.pdf`).

---

## 5. Local Development Setup

### Prerequisites
- Node.js 20.9+ (tested on Node 22 & 24 LTS)
- A Neon account (free tier) with Neon CLI installed (`npm install -g neonctl` or `neon login`)

### 1. Clone & Install
```bash
git clone https://github.com/jackyjky123-ship-it/resume_ai.git
cd resume_ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Required variables:
```dotenv
# Neon PostgreSQL connection strings
DATABASE_URL="postgresql://user:pass@ep-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full"
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-direct.us-east-2.aws.neon.tech/neondb?sslmode=verify-full"

# Neon Auth & Services
NEON_BRANCH="production"
NEON_AUTH_BASE_URL="https://your-auth-url.neon.tech/auth"
NEON_AUTH_JWKS_URL="https://your-auth-url.neon.tech/auth/.well-known/jwks.json"
NEON_FUNCTION_HELLO_BASE_URL="https://your-functions-url.neon.tech"

# App-generated session cookie secret (generate with node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
NEON_AUTH_COOKIE_SECRET="your-32-byte-base64-secret"

# Google Gemini API Key (Phase 5 AI features)
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Initialize Database
```bash
# Generate Prisma Client (outputs to src/generated/prisma)
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 6. Test Suites & Verification

The project includes unit, integration, security, and rendering test suites:

```bash
# Run unit tests (Zod schemas, defensive parsing, template metadata, filename sanitizers)
npm test

# Run database & security integration tests (Postgres CRUD, template switches, cross-user ownership isolation)
npm run test:integration

# Strict TypeScript typecheck
npx tsc --noEmit

# ESLint flat configuration check
npm run lint

# PDF rendering smoke test
npm run pdf:test

# AI integration & quota tracking smoke test
npm run ai:test

# Full production build
npm run build
```

---

## 7. Deployment Guide (Vercel + Neon)

### Step 1: Deploy to Vercel
1. Push repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project** → Import `resume_ai`.
3. Vercel automatically detects Next.js.
4. Verify the Build Command is `npm run build` (which automatically triggers `prisma generate && next build`).

### Step 2: Configure Environment Variables in Vercel
In **Project Settings → Environment Variables**, add:
- `DATABASE_URL` (Neon pooled connection string)
- `DATABASE_URL_UNPOOLED` (Neon direct connection string)
- `NEON_BRANCH` (`production`)
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_JWKS_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `GEMINI_API_KEY`

### Step 3: Authorize Vercel Domain in Neon Auth
To allow cross-origin auth flows and OAuth redirects to the production site:
```bash
# Add your production Vercel URL
neon neon-auth domain add https://<your-project-name>.vercel.app
```
Verify the domain is trusted:
```bash
neon neon-auth domain list
```

### Step 4: Configure Custom Domain (Optional)
To connect a custom domain (e.g., `resumeai.dev` or `app.yourdomain.com`):
1. Add the domain in **Vercel Settings → Domains**.
2. Point your registrar DNS to Vercel (A Record `76.76.21.21`, CNAME `cname.vercel-dns.com`).
3. Authorize the domain in Neon Auth:
   ```bash
   neon neon-auth domain add https://yourdomain.com
   ```
For complete DNS tables, Cloudflare configuration, and troubleshooting, read the full [Custom Domain Setup Guide](docs/custom-domain-setup.md).

---

## 8. Free-Tier Quotas & Known Constraints

| Component | Free-Tier Limits | Architecture Handling |
|---|---|---|
| **Neon PostgreSQL** | Free shared compute, auto-suspend after inactivity. | The app handles cold start reconnects via `@prisma/adapter-pg` pool pooling. |
| **Neon Auth** | Managed Better Auth schema (`neon_auth`). | App models live in `public` schema; linked lazily on first authenticated request. |
| **Google Gemini API** | 15 RPM / free-tier daily quotas. | Hard per-user daily limits (15 requests/day) tracked in PostgreSQL. UI shows clean `429` error states without disrupting manual editing. |
| **Vercel Hobby** | Serverless function execution timeout (15s). | PDF generation and AI prompts are optimized to stream under 2.5 seconds. |

---

## 9. Security & Privacy

- **Session-Based Ownership**: All mutations and reads query records scoped by the session `User.id`. Client-supplied user IDs in request bodies are explicitly ignored.
- **Server-Only Secrets**: All credentials and API keys are imported via `"server-only"` modules; never prefixed with `NEXT_PUBLIC_`.
- **Zero Model Training**: Disclosed in `/privacy`: resume content is processed ephemerally and never retained by Google or ResumeAI for machine learning training.
- **Cascade Deletion**: Account deletion or resume removal permanently purges all child records, JSON documents, and usage histories.

---

## 10. License

Released under the [MIT License](LICENSE).
