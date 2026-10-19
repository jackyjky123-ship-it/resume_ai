# AGENTS.md

## Status: planning only — no code yet

- This repo contains **only `PLAN.md`** — no `package.json`, no source, no config, no CI. Nothing can be run, linted, or tested until the app is scaffolded.
- Do not invent commands. Commands below (and in `PLAN.md` §17) are **planned**, not yet executable.

## Source of truth: `PLAN.md`

- `PLAN.md` is the implementation plan and checklist. Read it before any feature work; follow its phase roadmap (Phase 1 setup → Phase 8 deployment) in order.
- If `AGENTS.md` and `PLAN.md` conflict, `PLAN.md` wins — and update this file. When implementation changes stack/command details, keep both consistent.
- Implementation principle from the plan: build in small, testable milestones — never one large generated change. After each phase, run the app, test the happy path and the failure path, and commit working results.

## Planned stack (verify against real `package.json` once it exists)

- Next.js App Router + TypeScript, Tailwind CSS, shadcn/ui + Lucide, React Hook Form + Zod.
- Prisma on Neon PostgreSQL; Auth.js sessions; Gemini API (free tier) behind a swappable AI service interface.
- PDF via `@react-pdf/renderer`; tests: Vitest + Playwright. Modular monolith — no microservices. Target tree: `PLAN.md` §7.

## Hard invariants (from `PLAN.md`; violating these breaks the spec)

- Every resume read/mutation checks ownership from the server session; never trust a client-supplied `userId`.
- No general arbitrary-prompt AI endpoint — only the fixed operations in `PLAN.md` §9, Zod-validated on input and output. Suggestions are accept/reject; never silently replace user content.
- Manual editing and PDF export must keep working when AI is down or quota-exhausted (helpful `429`, never a blocked core flow).
- AI privacy: send only the minimum fields needed; never log full resumes or secrets; prompts must never invent employers, degrees, skills, or metrics.
- Secrets stay server-only; never prefix them with `NEXT_PUBLIC_`. `.env.example` holds placeholders only; never commit `.env`.
- Schema changes only via Prisma migrations: `migrate dev` locally, `migrate deploy` in production.

## Planned commands (not yet executable)

```bash
npx create-next-app@latest resume-ai   # Phase 1: TypeScript + ESLint + Tailwind + App Router + src/
npm run dev
npx prisma generate
npx prisma migrate dev --name init     # local development
npx prisma migrate deploy              # production
```

- Planned env vars: `DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY` (`PLAN.md` §16).
- At scaffold time, fill in real lint/typecheck/test commands here and delete the "planned" caveat.

## Open decision — confirm with the user before scaffolding

- `PLAN.md` names the project root `resume-ai/` (hyphen) but the working directory is `resume_ai` (underscore). Confirm whether to scaffold in place or in a nested `resume-ai/` folder before running `create-next-app`.
