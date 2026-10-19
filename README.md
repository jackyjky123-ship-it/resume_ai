# ResumeAI

A full-stack resume builder that helps users create, edit, preview, and export professional resumes — with optional AI writing suggestions from a free-tier provider. The manual editor and PDF export keep working even when AI is unavailable.

**Status: Phase 1 — project setup complete.** Database, authentication, resume editing, AI suggestions, PDF export, and tests are the next phases of the roadmap in [`PLAN.md`](./PLAN.md) and are **not implemented yet**.

## Stack (as scaffolded)

| Area | Choice |
| --- | --- |
| Framework | Next.js 16.4.2 (App Router, TypeScript strict, Turbopack dev + build) |
| UI | React 19.3, Tailwind CSS 4, ESLint 9 (flat config) |
| Planned next | Prisma on Neon PostgreSQL (Phase 2), Auth.js (Phase 3), Gemini API behind a swappable AI service (Phase 5), `@react-pdf/renderer` (Phase 6), Vitest + Playwright (Phase 7) |

## Getting started

Requires Node.js 20.9+ (developed on Node 24 LTS).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) at http://localhost:3000 |
| `npm run build` | Production build (Turbopack) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint 9 CLI — `next build` no longer lints in Next 16, so run this separately |
| `npx tsc --noEmit` | Strict TypeScript check |

## Environment variables

`.env.example` documents placeholder values only (`DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY`). Copy it to `.env` locally when you reach the phase that needs each value (Phases 2, 3, 5). Never commit `.env`, and keep all of these server-only — never expose them to the client bundle.

## Roadmap

The complete implementation plan — feature scope, architecture, security checklist, and the Phase 1 → Phase 8 checklist — is [`PLAN.md`](./PLAN.md). Agent/contributor working rules are in [`AGENTS.md`](./AGENTS.md).
