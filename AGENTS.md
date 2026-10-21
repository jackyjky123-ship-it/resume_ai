<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Status: Phase 8 complete — MVP fully implemented, deployed to Vercel, and portfolio-ready

- Phases 1–8 are complete and checked off in `PLAN.md` §14, and all §20 Definition of Done criteria are satisfied.
- Production deployment: live on Vercel at `https://resume-ai-one-nu.vercel.app` (linked to GitHub repo `jackyjky123-ship-it/resume_ai`).
- Post-MVP stretch goals: Phase 9 (Public Shareable Links & View Analytics) and Phase 10 (Cover Letter Builder) are planned in `PLAN.md` §14 for future execution.
- Database & Infrastructure: Neon PostgreSQL (serverless, pooled for runtime via `@prisma/adapter-pg`, direct for migrations), Neon Auth (Managed Better Auth in `neon_auth` schema), authorized production domain in Neon Auth.
- Build & Verification: `package.json` runs `prisma generate && next build`. Comprehensive unit tests (`npm test`), database/security integration tests (`npm run test:integration`), strict TypeScript check (`npx tsc --noEmit`), ESLint 9 (`npm run lint`), and production Next.js 16 App Router build all pass cleanly with exit code 0.
- Documentation: Top-level `README.md` includes system architecture diagrams, database schema, local setup, test commands, Vercel/Neon deployment instructions, and free-tier quota analysis.
- Follow the implementation principle: build in small, testable milestones; commit working results.

## Source of truth: `PLAN.md`

- `PLAN.md` is the implementation plan and checklist. Read it before any feature work; follow its phase roadmap (Phase 1 setup → Phase 8 deployment) in order.
- If `AGENTS.md` and `PLAN.md` conflict, `PLAN.md` wins — and update this file. When implementation changes stack/command details, keep both consistent.
- Implementation principle from the plan: build in small, testable milestones — never one large generated change. After each phase, run the app, test the happy path and the failure path, and commit working results.

## Actual stack (verified against `package.json` after Phase 4)

- Next.js **16.4.2** App Router, **React 19.3**, **TypeScript 5 (strict)**, **Tailwind CSS 4** (CSS-first config in `src/app/globals.css`, Tailwind via Turbopack loader), **ESLint 9** flat config in `eslint.config.mjs`.
- Turbopack is the default bundler for `next dev` **and** `next build`. `next.config.ts` enables `cacheComponents: true` — respect the Cache Components model; do not disable it without reading `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`.
- Import alias `@/*` → `src/*`. Generated route type helpers (`LayoutProps`, `PageProps`, `RouteContext`) are available once the route has been through a dev/build pass; a brand-new route may need an explicit `params: Promise<...>` type until types regenerate.
- **Neon services** are wired and verified: Lakebase Postgres, Neon Auth, and the deployed `hello` Neon Function. `neon.ts` (Neon infra-as-code) + `hello.ts` sit at the repo root; `.neon` holds the project/branch link (git-ignored).
- **Prisma 7.10.1** with driver adapters: runtime client uses `@prisma/adapter-pg` + the **pooled** `DATABASE_URL` in `src/lib/prisma.ts` (globalThis singleton); the CLI reads `prisma.config.ts`, which loads `.env.local` via dotenv and points migrations at the **direct** `DATABASE_URL_UNPOOLED` — the pooled URL breaks Prisma Migrate. Schema: `prisma/schema.prisma` with the ESM `prisma-client` generator, output `src/generated/prisma` (git-ignored; run `npm run db:generate` after clone). Better Auth tables live in `neon_auth` and are **not** part of the Prisma schema.
- **Forms + UI**: Zod **4.6**, React Hook Form **7.90**, `@hookform/resolvers` **5.9.2** (pinned; v6's optional peers conflict with Prisma 7's `effect@3` and Neon Auth's nested resolver), shadcn/ui (radix base, Nova preset), `sonner` toasts, `lucide-react`. `@hookform/resolvers` v5 is also what Neon Auth UI uses, so the project resolves one copy of the resolver.
- `shadcn` is a **devDependency** (CLI only). Its `shadcn/tailwind.css` import is a build-time CSS import; do not move it into runtime code. shadcn tokens in `globals.css` are mapped onto the existing ResumeAI palette (`--primary` is Instagram-blue `#0095f6`, `--destructive` is `#ed4956`, card/border/muted reuse the existing grays), so shadcn primitives blend with the hand-built landing/dashboard UI.
- `src/lib/utils.ts` re-exports `cn` from the `cn` package (the style generated by shadcn 4.22); generated components in `src/components/ui` import from `"cn"` directly.
- Session checks: `src/lib/auth/server.ts` (`auth.getSession()`) is the single server-side source of identity; `src/proxy.ts` (`auth.middleware`) only does optimistic redirects for `/dashboard` + `/resumes` — real authorization happens in pages/services/actions via `getSessionUser()`/`requireUser()` and repository filters.
- Planned for later phases (not installed yet): Gemini API behind `src/server/services/ai.service.ts` (Phase 5), `@react-pdf/renderer` (Phase 6), Vitest + Playwright (Phase 7). Modular monolith; target tree in `PLAN.md` §7.

## Domain and editor architecture (Phase 4)

- `src/lib/validations/resume.ts` owns the versioned `ResumeDocument` Zod schema (`version: 1`), stable-ID repeatable entries, length/array limits, entry factories, and the create/rename/save/editor form schemas. Drafts may be incomplete (empty strings are valid), but shape/limits/IDs are always enforced server-side.
- `src/lib/resume-meta.ts` is dependency-free (no Zod) so dashboard clients can import template IDs/names, sections, `DashboardResume`, and `formatRelativeTime`. `src/lib/resume-content.ts` computes filled dashboard sections from a parsed document.
- `src/server/services/resume.service.ts` is the business layer: parses/validates input, always scopes every read/write/duplicate/delete to the session user, maps Prisma rows to serializable dashboard/editor DTOs, and normalizes invalid stored JSON to a blank draft. `src/server/repositories/resume.repository.ts` stays data-access only.
- `src/server/actions/resume.actions.ts` holds the `"use server"` mutations. It returns typed `{ ok, data }` / `{ ok: false, error }` results instead of leaking exceptions; ownership failures return not-found. Create/rename/duplicate/delete revalidate `/dashboard`; autosave does not (it would re-render the editor on every save).
- `src/lib/auth/current-user.ts` resolves the Neon Auth session to the app `User` (upsert by `authUserId`, React `cache` per request) and `requireUser()` redirects for pages.
- Editor: `/resumes/[resumeId]/edit` streams behind `<Suspense>`; the page passes the un-awaited `params` promise into the boundary and awaits it inside (awaiting at page top level breaks Cache Components prerendering). There is no `/resumes/new`; the dashboard's create action returns an ID and the client navigates to the editor.
- Autosave (`use-resume-autosave.ts`): 1.2s debounce, one in-flight save, latest snapshot queued after an in-flight save, Zod-invalid drafts are not persisted, `beforeunload` + in-app back-navigation confirmation while dirty, inline Saved/Unsaved/Saving/Fix-fields/Couldn't-save-retry states.
- The editor preview and PDF generator support Classic, Modern, Compact, Professional, Editorial, and Designer templates. Editorial provides a clean two-column layout with split-tone typography, portrait photo frame, and a dashed skill highlights grid. Designer provides a structured two-column layout with portrait photo block, vertical divider line, rail contacts/skills, and declaration statement.
- Cross-user editor requests render the not-found UI without leaking the title. Because `notFound()` runs after the streamed shell, the HTTP status can be 200 (streamed not-found) rather than 404; `scripts/editor-test.ts` asserts the UI + absence of the other user's title. If a true 404 status ever becomes required, `export const instant = false` is the documented blocking escape hatch.

## Next.js 16 conventions that differ from older docs

- **Middleware is now Proxy** (Next 16 rename): route protection lives in `src/proxy.ts` (`auth.middleware`, nodejs runtime). Keep protected matchers narrow (`/dashboard/:path*`, `/resumes/:path*`). Do not create `middleware.ts`.
- `next lint` is **removed** in v16: run ESLint via the CLI (`npm run lint`); `next build` no longer lints.
- Request APIs are async-only: `params`, `searchParams`, `cookies()`, `headers()` must be `await`ed. With `cacheComponents`, runtime data reads (session, params) must sit inside `<Suspense>`; do not await `params` at the page top level.
- `next dev` writes to `.next/dev/`; `next build` writes to `.next/`. Concurrent dev + build is supported.
- Version-matched docs are bundled at `node_modules/next/dist/docs/` — consult them (especially the v16 upgrade guide) before touching framework APIs.
- `next build` may log a benign `[neon-auth] Cookie validation error before getSession upstream call` while prerendering the dashboard shell; the build still completes and the auth read is handled by the Suspense boundary.

## Hard invariants (from `PLAN.md`; violating these breaks the spec)

- Every resume read/mutation checks ownership from the server session; never trust a client-supplied `userId`.
- No general arbitrary-prompt AI endpoint — only the fixed operations in `PLAN.md` §9, Zod-validated on input and output. Suggestions are accept/reject; never silently replace user content.
- Manual editing and PDF export must keep working when AI is down or quota-exhausted (helpful `429`, never a blocked core flow).
- AI privacy: send only the minimum fields needed; never log full resumes or secrets; prompts must never invent employers, degrees, skills, or metrics.
- Secrets stay server-only; never prefix them with `NEXT_PUBLIC_`. `.env.example` holds placeholders only; never commit `.env`.
- Schema changes only via Prisma migrations: `migrate dev` locally, `migrate deploy` in production.
- Editor content is only persisted after `ResumeDocument` validation. Never bypass the service with a raw client-supplied document.

## Dependency audit note (re-checked after Phase 4)

- `npm audit --omit=dev` reports **0 vulnerabilities** in runtime dependencies.
- `npm audit` reports **9 high-severity advisories**, all in dev-only tooling: the ESLint chain (`braces` → `micromatch` → `fast-glob` → `@next/eslint-plugin-next` → `eslint-config-next`) plus the shadcn CLI's `fast-glob`/`ts-morph`/`@shadcn/registry` chain. `shadcn` was moved to `devDependencies` so the runtime tree stays clean.
- `braces@3.0.3` is already the newest published version; the only `npm audit fix --force` offer is a **breaking downgrade** — do not run it. Re-check after `eslint-config-next`/`shadcn` updates and surface audit results when CI arrives (Phase 7).
- `@hookform/resolvers@6` currently conflicts with the project's optional peer graph, so the root dependency is pinned to `5.9.2`. `.npmrc` sets `legacy-peer-deps=true` so a fresh `npm install`/`npm ci` resolves the same tree; revisit when Prisma/Neon packages move past `effect@3`.

## Commands (verified through Phase 4)

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
npm run dashboard:test  # real dashboard smoke test (needs `npm start`); keeps preview@example.com / preview-1234 for browser sign-in
npm run editor:test  # Phase 4 schema/persistence/ownership + editor-route smoke test (needs `npm start`; cleans up its rows)
npm run ai:test      # BYOK AI integration + mock fallback smoke test
npm run cv:test      # CV tools and parser unit smoke test

neon status          # branch live state (Neon CLI authenticated via `neon login`)
neon config plan     # dry-run diff of neon.ts against the branch
neon deploy          # apply neon.ts (provisions services/functions, pulls env into .env.local)
```

- Test scripts (Vitest/Playwright) do not exist yet; they arrive in Phase 7 per the plan. `scripts/db-test.ts`, `scripts/auth-test.ts`, `scripts/dashboard-test.ts`, and `scripts/editor-test.ts` are phase-verification smoke tests, not the Phase 7 suites.
- `editor:test` signs up a fresh `phase4-*` account, hits the dashboard to link the app user, verifies schema guards and DB ownership, checks that the owner's editor renders while a cross-user editor shows only the not-found UI (no title leak), checks anonymous access redirects, then removes all `phase4-*` app/auth rows in a `finally` block. It only asserts server-rendered HTML — hydration/client-hook failures are invisible to it, so click through the editor and dashboard CRUD in a browser until the Phase 7 Playwright suite exists.
- `dashboard:test` signs in `preview@example.com` / `preview-1234` (creating it if needed) and asserts the real-data workspace renders; that account is intentionally kept for browser previews.
- Env placeholders are documented in `.env.example`: Neon-managed vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`, `NEON_FUNCTION_HELLO_BASE_URL`) are written by `neon deploy`/`neon env pull` into `.env.local`; app-generated var `NEON_AUTH_COOKIE_SECRET` must be created manually; AI features use the BYOK model (users enter their own key in the UI; no server GEMINI_API_KEY needed). All server-only; never commit `.env*`.
