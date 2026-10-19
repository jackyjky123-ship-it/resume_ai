<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Status: Phase 2 complete — Neon services wired (Postgres/Prisma, Neon Auth, Functions); editor phase pending

- Phase 1 scaffold + Phase 2 database are done. Neon services were set up with the Neon CLI (`neon.ts` = `postgres` (default) + `auth: true` + `functions.hello`), linked to project `sweet-glade-54193070`, branch `production`. Do not add app features out of phase order; next work is the remaining Phase 3 checklist, then Phase 4.
- Identity moved to **Neon Auth (Managed Better Auth)** per the Neon services setup — not Auth.js (PLAN.md Phase 3 updated to match). Users/sessions live in the `neon_auth` schema; login UI, protected pages, and ownership helpers are still to build.

- The Next.js app is scaffolded in place at the repo root (`resume_ai/`); there is no nested `resume-ai/` folder. The former open naming decision is resolved: treat `ResumeAI` as the product name and this directory is the app root.
- Working baseline: marketing landing page + login page + protected dashboard stub, working Neon Auth sign-up/sign-in/sign-out flows, Prisma CRUD repository, deployed `hello` Neon Function. Editor, PDF, AI, and formal test suites still pending — do not implement them out of order.
- Follow the implementation principle in each phase of `PLAN.md` §14: build, run, test the happy path and failure path, commit.

## Source of truth: `PLAN.md`

- `PLAN.md` is the implementation plan and checklist. Read it before any feature work; follow its phase roadmap (Phase 1 setup → Phase 8 deployment) in order.
- If `AGENTS.md` and `PLAN.md` conflict, `PLAN.md` wins — and update this file. When implementation changes stack/command details, keep both consistent.
- Implementation principle from the plan: build in small, testable milestones — never one large generated change. After each phase, run the app, test the happy path and the failure path, and commit working results.

## Actual stack (verified against `package.json` after scaffolding)

- Next.js **16.4.2** App Router, **React 19.3**, **TypeScript 5 (strict)**, **Tailwind CSS 4** (CSS-first config in `src/app/globals.css`, Tailwind via Turbopack loader), **ESLint 9** flat config in `eslint.config.mjs`.
- Turbopack is the default bundler for `next dev` **and** `next build`. `next.config.ts` enables `cacheComponents: true` — when adding pages (Phase 4+), respect the Cache Components model or consult `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` before disabling it.
- Import alias `@/*` → `src/*`. Generated route type helpers (`LayoutProps`, `PageProps`, `RouteContext`) are available; request APIs are async (see below).
- **Neon services** are wired and verified: Lakebase Postgres, Neon Auth (Managed Better Auth), and the deployed `hello` Neon Function. `neon.ts` (Neon infra-as-code) + `hello.ts` sit at the repo root; `.neon` holds the project/branch link (git-ignored).
- **Prisma 7.10.1** with driver adapters: runtime client uses `@prisma/adapter-pg` + the **pooled** `DATABASE_URL` in `src/lib/prisma.ts` (globalThis singleton); the CLI reads `prisma.config.ts`, which loads `.env.local` via dotenv and points migrations at the **direct** `DATABASE_URL_UNPOOLED` — the pooled URL breaks Prisma Migrate. Schema: `prisma/schema.prisma` with the ESM `prisma-client` generator, output `src/generated/prisma` (git-ignored; generate after clone, `postinstall` not configured). App users link to Better Auth ids via `User.authUserId`; the Better Auth tables themselves live in the `neon_auth` schema and are **not** part of the Prisma schema.
- Session checks: `src/lib/auth/server.ts` (`auth.getSession()`) is the single server-side source of user identity; `src/proxy.ts` (`auth.middleware`) only does optimistic redirects for `/dashboard` + `/resumes` — real authorization happens in pages/actions using `auth.getSession()` + repository filters (`src/server/repositories/resume.repository.ts`).
- Pages that read the session must keep the read inside a `<Suspense>` boundary (Cache Components) — see `src/app/dashboard/page.tsx` (route compiles as Partial Prerender ◐).
- Planned for later phases (not installed yet): Zod + React Hook Form + shadcn/ui (Phases 3–4), Gemini API behind `src/server/services/ai.service.ts` (Phase 5), `@react-pdf/renderer` (Phase 6), Vitest + Playwright (Phase 7). Modular monolith; target tree in `PLAN.md` §7.

## Next.js 16 conventions that differ from older docs

- **Middleware is now Proxy** (Next 16 rename): route protection lives in `src/proxy.ts` (`auth.middleware`, nodejs runtime) — exists; keep protected matchers narrow (`/dashboard/:path*`, `/resumes/:path*`). Do not create `middleware.ts`.
- `next lint` is **removed** in v16: run ESLint via the CLI (`npm run lint`); `next build` no longer lints.
- Request APIs are async-only: `params`, `searchParams`, `cookies()`, `headers()` must be `await`ed. Prerender-time `cookies()` reads must sit behind `<Suspense>` when `cacheComponents` is on.
- `next dev` writes to `.next/dev/`; `next build` writes to `.next/`. Concurrent dev + build is supported.
- Version-matched docs are bundled at `node_modules/next/dist/docs/` — consult them (especially the v16 upgrade guide) before touching framework APIs.

## Hard invariants (from `PLAN.md`; violating these breaks the spec)

- Every resume read/mutation checks ownership from the server session; never trust a client-supplied `userId`.
- No general arbitrary-prompt AI endpoint — only the fixed operations in `PLAN.md` §9, Zod-validated on input and output. Suggestions are accept/reject; never silently replace user content.
- Manual editing and PDF export must keep working when AI is down or quota-exhausted (helpful `429`, never a blocked core flow).
- AI privacy: send only the minimum fields needed; never log full resumes or secrets; prompts must never invent employers, degrees, skills, or metrics.
- Secrets stay server-only; never prefix them with `NEXT_PUBLIC_`. `.env.example` holds placeholders only; never commit `.env`.
- Schema changes only via Prisma migrations: `migrate dev` locally, `migrate deploy` in production.

## Dependency audit note (Phase 1, re-checked after Neon wiring)

- `npm audit --omit=dev` reports **0 vulnerabilities** in runtime dependencies (including the Neon and Prisma packages).
- `npm audit` reports **5 high-severity advisories**, all in the dev-only lint toolchain (`braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`). No runtime dependency is affected.
- `braces@3.0.3` is already the newest published version, so the only `npm audit fix --force` offer (downgrading to `eslint-config-next@14.2.35`) is a **breaking change — do not run it**. Re-check after `eslint-config-next` updates and surface audit results in CI when the repo gains CI (Phase 7).

## Commands (verified through Phase 2)

```bash
npm run dev          # next dev (Turbopack) → http://localhost:3000
npm run build        # next build (Turbopack, production)
npm run lint         # ESLint 9 CLI with eslint.config.mjs — run separately; build does not lint
npm start            # serve the production build
npx tsc --noEmit     # strict TypeScript check

npm run db:generate  # prisma generate → src/generated/prisma (run after clone; not a postinstall hook)
npm run db:migrate   # prisma migrate dev — CLI reads prisma.config.ts; direct (unpooled) URL
npm run db:deploy    # prisma migrate deploy (production migrations)
npm run db:test      # Prisma + pooled DATABASE_URL smoke test (create/read/ownership/cascade)
npm run auth:test    # Neon Auth e2e through the app (needs `npm start` running on :3000)

neon status          # branch live state (Neon CLI authenticated via `neon login`)
neon config plan     # dry-run diff of neon.ts against the branch
neon deploy          # apply neon.ts (provisions services/functions, pulls env into .env.local)
```

- Test scripts (Vitest/Playwright) do not exist yet; they arrive in Phase 7 per the plan. `scripts/db-test.ts` and `scripts/auth-test.ts` are phase-verification smoke tests, not the Phase 7 suites.
- Env placeholders are documented in `.env.example`: Neon-managed vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `NEON_FUNCTION_HELLO_BASE_URL`) are written by `neon deploy`/`neon env pull` into `.env.local`; app-generated var `NEON_AUTH_COOKIE_SECRET` must be created manually; `GEMINI_API_KEY` (Phase 5) stays a placeholder. All server-only; never commit `.env*`.
