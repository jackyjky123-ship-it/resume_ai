<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Status: Phase 1 complete — scaffold in place; Phases 2–8 pending

- The Next.js app is scaffolded in place at the repo root (`resume_ai/`); there is no nested `resume-ai/` folder. The former open naming decision is resolved: treat `ResumeAI` as the product name and this directory as the app root.
- Working baseline: Next.js scaffold page with branded metadata, `.gitignore`, `.env.example`, README. No database, auth, editor, AI, PDF, or tests exist yet — do not implement them out of order.
- Follow the implementation principle in each phase of `PLAN.md` §14: build, run, test the happy path and failure path, commit.

## Source of truth: `PLAN.md`

- `PLAN.md` is the implementation plan and checklist. Read it before any feature work; follow its phase roadmap (Phase 1 setup → Phase 8 deployment) in order.
- If `AGENTS.md` and `PLAN.md` conflict, `PLAN.md` wins — and update this file. When implementation changes stack/command details, keep both consistent.
- Implementation principle from the plan: build in small, testable milestones — never one large generated change. After each phase, run the app, test the happy path and the failure path, and commit working results.

## Actual stack (verified against `package.json` after scaffolding)

- Next.js **16.4.2** App Router, **React 19.3**, **TypeScript 5 (strict)**, **Tailwind CSS 4** (CSS-first config in `src/app/globals.css`, Tailwind via Turbopack loader), **ESLint 9** flat config in `eslint.config.mjs`.
- Turbopack is the default bundler for `next dev` **and** `next build`. `next.config.ts` enables `cacheComponents: true` — when adding pages (Phase 4+), respect the Cache Components model or consult `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` before disabling it.
- Import alias `@/*` → `src/*`. Generated route type helpers (`LayoutProps`, `PageProps`, `RouteContext`) are available; request APIs are async (see below).
- Planned for later phases (not installed yet): Prisma + Neon PostgreSQL (Phase 2), Auth.js (Phase 3), Zod + React Hook Form + shadcn/ui + Lucide (Phases 3–4), Gemini API behind `src/server/services/ai.service.ts` (Phase 5), `@react-pdf/renderer` (Phase 6), Vitest + Playwright (Phase 7). Modular monolith; target tree in `PLAN.md` §7.

## Next.js 16 conventions that differ from older docs

- **Middleware is now Proxy** (Next 16 rename): the route-protection file will be `src/proxy.ts` exporting a function named `proxy` (nodejs runtime). Implement the plan's `src/middleware.ts` idea under this name in Phase 3; do not create `middleware.ts`.
- `next lint` is **removed** in v16: run ESLint via the CLI (`npm run lint`); `next build` no longer lints.
- Request APIs are async-only: `params`, `searchParams`, `cookies()`, `headers()` must be `await`ed (relevant to Phase 3 sessions and Phase 4 `PageProps`).
- `next dev` writes to `.next/dev/`; `next build` writes to `.next/`. Concurrent dev + build is supported.
- Version-matched docs are bundled at `node_modules/next/dist/docs/` — consult them (especially the v16 upgrade guide) before touching framework APIs.

## Hard invariants (from `PLAN.md`; violating these breaks the spec)

- Every resume read/mutation checks ownership from the server session; never trust a client-supplied `userId`.
- No general arbitrary-prompt AI endpoint — only the fixed operations in `PLAN.md` §9, Zod-validated on input and output. Suggestions are accept/reject; never silently replace user content.
- Manual editing and PDF export must keep working when AI is down or quota-exhausted (helpful `429`, never a blocked core flow).
- AI privacy: send only the minimum fields needed; never log full resumes or secrets; prompts must never invent employers, degrees, skills, or metrics.
- Secrets stay server-only; never prefix them with `NEXT_PUBLIC_`. `.env.example` holds placeholders only; never commit `.env`.
- Schema changes only via Prisma migrations: `migrate dev` locally, `migrate deploy` in production.

## Dependency audit note (Phase 1)

- `npm audit` reports **5 high-severity advisories**, all in the dev-only lint toolchain (`braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`). No runtime dependency is affected.
- `braces@3.0.3` is already the newest published version, so the only `npm audit fix --force` offer (downgrading to `eslint-config-next@14.2.35`) is a **breaking change — do not run it**. Re-check after `eslint-config-next` updates and surface audit results in CI when the repo gains CI (Phase 7).

## Commands (verified in Phase 1)

```bash
npm run dev          # next dev (Turbopack) → http://localhost:3000
npm run build        # next build (Turbopack, production)
npm run lint         # ESLint 9 CLI with eslint.config.mjs — run separately; build does not lint
npm start            # serve the production build
npx tsc --noEmit     # strict TypeScript check
```

Database commands (add in Phase 2, after installing Prisma; not yet available):

```bash
npx prisma generate
npx prisma migrate dev --name init   # local development
npx prisma migrate deploy            # production
```

- Test scripts (Vitest/Playwright) do not exist yet; they arrive in Phase 7 per the plan.
- Env placeholders are documented in `.env.example` per `PLAN.md` §16: `DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY` — all server-only. Copy to `.env` locally when the phase that needs each value lands; never commit `.env`.
