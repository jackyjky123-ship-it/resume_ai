# Graph Report - resume_ai  (2026-10-22)

## Corpus Check
- 137 files · ~151,021 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .example 1, .toml 1)

## Summary
- 954 nodes · 2644 edges · 42 communities (37 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Core Components
- Resume Editor Form Controls
- CV Import and Parsing Pipeline
- Template Sheet Previews
- AI Service and Mock Fallback
- CV File Import Test Harness
- React PDF Rendering Engine
- Dashboard Workspace and Actions
- Unit Test Verification Suite
- Resume Document Schema Validations
- Package Dependencies Manifest
- Editor Persistence Test Suite
- Project Build and Test Scripts
- CV Tools Test Harness
- Dashboard and Navigation Pages
- Shadcn UI Configuration
- Neon Infrastructure and SDK
- Neon Auth Route Handlers
- Landing Page and Previews
- Resume Repository and Database Access
- TypeScript Compiler Configuration
- Prisma Database and Auth Tests
- Development Dependencies
- Client API Key Store and Tests
- Next.js Config and Auth Flow
- Architecture Rules and Invariants
- Integration Test Verification
- Root Layout and Global Styling
- Empty State UI Components
- Project Documentation Architecture
- Design System UI Reference
- Hyphenation Patching Utility
- PDF Export API Route
- Theme Color and Typography
- Template System Specifications
- Phase Roadmap and Milestones
- ESLint Configuration
- Dashboard E2E Smoke Tests
- BYOK AI Architecture
- Custom Domain DNS Setup

## God Nodes (most connected - your core abstractions)
1. `react` - 57 edges
2. `Button()` - 55 edges
3. `lucide-react` - 36 edges
4. `GenerateCvDialog()` - 33 edges
5. `ImportCvDialog()` - 30 edges
6. `ResumeEditor()` - 28 edges
7. `cn` - 25 edges
8. `emptyResumeDocument()` - 24 edges
9. `scripts` - 23 edges
10. `DashboardWorkspace()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `emptyResumeDocument()`  [EXTRACTED]
  scripts/cv-ui-test.ts → src/lib/validations/resume.ts
- `main()` --calls--> `filledSectionsOf()`  [EXTRACTED]
  scripts/editor-test.ts → src/lib/resume-content.ts
- `main()` --calls--> `parseResumeDocument()`  [EXTRACTED]
  scripts/editor-test.ts → src/lib/validations/resume.ts
- `main()` --calls--> `emptyResumeDocument()`  [EXTRACTED]
  scripts/integration-test.ts → src/lib/validations/resume.ts
- `samplePopulatedResume()` --calls--> `newCertificationEntry()`  [EXTRACTED]
  scripts/pdf-test.ts → src/lib/validations/resume.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Human-in-the-Loop and Anti-Hallucination AI Architecture** — plan_ai_service_design, readme_byok_ai_architecture, readme_core_philosophy, agents_hard_invariants [EXTRACTED 1.00]
- **Session-Scoped Security and Data Isolation Boundary** — agents_hard_invariants, plan_security_privacy_framework, readme_system_architecture, agents_neon_auth_integration [EXTRACTED 1.00]
- **Production Custom Domain and Neon Auth Routing Pipeline** — docs_custom_domain_setup_architecture, docs_custom_domain_setup_neon_auth_trusted_domains, docs_custom_domain_setup_dns_configuration, readme_system_architecture [EXTRACTED 1.00]

## Communities (42 total, 5 thin omitted)

### Community 0 - "UI Core Components"
Cohesion: 0.05
Nodes (85): class-variance-authority, cn, radix-ui, react, sonner, DashboardError(), EditorError(), DeleteResumeDialog() (+77 more)

### Community 1 - "Resume Editor Form Controls"
Cohesion: 0.08
Nodes (61): lucide-react, react-hook-form, BulletLinesField(), BulletLinesFieldProps, CertificationsSection(), FormPath, EducationSection(), FormPath (+53 more)

### Community 2 - "CV Import and Parsing Pipeline"
Cohesion: 0.05
Nodes (72): fflate, unpdf, zod, POST(), generate(), selectFile(), handleImprove(), getSessionUser (+64 more)

### Community 3 - "Template Sheet Previews"
Cohesion: 0.15
Nodes (35): ResumeCardPreview(), Bar(), ClassicSheet(), CompactSheet(), DesignerSheet(), EditorialSheet(), ModernSheet(), ProfessionalSheet() (+27 more)

### Community 4 - "AI Service and Mock Fallback"
Cohesion: 0.13
Nodes (39): applyProject(), articleFor(), cleanHeading(), clip(), containsAlias(), DATE_RANGE_RE, detectSection(), escapeRegExp() (+31 more)

### Community 5 - "CV File Import Test Harness"
Cohesion: 0.10
Nodes (20): assert(), assertParsed(), execFileAsync, findEdge(), importFile(), ImportOk, main(), makeDocx() (+12 more)

### Community 6 - "React PDF Rendering Engine"
Cohesion: 0.18
Nodes (29): @react-pdf/renderer, ClassicPdf(), styles, CompactPdf(), styles, DesignerPdf(), getInitials(), MailIcon() (+21 more)

### Community 7 - "Dashboard Workspace and Actions"
Cohesion: 0.13
Nodes (26): DashboardUser, DashboardWorkspace(), handleCreate(), handleDelete(), handleDuplicate(), handleRename(), friendlyName(), initialsOf() (+18 more)

### Community 8 - "Unit Test Verification Suite"
Cohesion: 0.14
Nodes (21): assert(), main(), testAiSchemas(), testFormattingHelpers(), testNormalizationAndParsing(), testResumeDocumentSchema(), testSampleDataIntegrity(), testSectionComputation() (+13 more)

### Community 9 - "Resume Document Schema Validations"
Cohesion: 0.07
Nodes (28): bulletText, CertificationEntry, certificationEntrySchema, CreateResumeInput, createResumeInputSchema, EducationEntry, educationEntrySchema, ExperienceEntry (+20 more)

### Community 10 - "Package Dependencies Manifest"
Cohesion: 0.08
Nodes (26): dependencies, class-variance-authority, cn, dotenv, fflate, @google/genai, @hookform/resolvers, lucide-react (+18 more)

### Community 11 - "Editor Persistence Test Suite"
Cohesion: 0.18
Nodes (24): assert(), cleanupTestRows(), connectionString, cookieJar(), main(), prisma, sampleDocument(), assert() (+16 more)

### Community 12 - "Project Build and Test Scripts"
Cohesion: 0.09
Nodes (23): scripts, ai:test, auth:test, build, cv:import:test, cv:test, cv:ui:test, dashboard:test (+15 more)

### Community 13 - "CV Tools Test Harness"
Cohesion: 0.11
Nodes (20): allIds, corpus, current, currentExperience, currentSkill, emptyDocument, emptySuggestions, languageDocument (+12 more)

### Community 14 - "Dashboard and Navigation Pages"
Cohesion: 0.17
Nodes (16): DashboardPage(), DashboardSkeleton(), WorkspaceWithSession(), NotFound(), metadata, PrivacyPage(), EditorSkeleton(), EditorWithSession() (+8 more)

### Community 15 - "Shadcn UI Configuration"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 16 - "Neon Infrastructure and SDK"
Cohesion: 0.09
Nodes (20): name, private, version, @google/genai, @hookform/resolvers, @neon/config, @neon/env, pg (+12 more)

### Community 17 - "Neon Auth Route Handlers"
Cohesion: 0.14
Nodes (14): @neondatabase/auth, server-only, DELETE, GET, PATCH, POST, PUT, AppUser (+6 more)

### Community 18 - "Landing Page and Previews"
Cohesion: 0.15
Nodes (18): Bar(), ClassicThumb(), CompactThumb(), DesignerThumb(), EditorialThumb(), HIGHLIGHT_STRIP, Home(), INCLUDED_FEATURES (+10 more)

### Community 19 - "Resume Repository and Database Access"
Cohesion: 0.23
Nodes (17): parseResumeDocument(), createResume(), deleteResumeOwnedBy(), getResumeOwnedBy(), listResumes(), listSelect, updateResumeOwnedBy(), asJson() (+9 more)

### Community 20 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 22 - "Prisma Database and Auth Tests"
Cohesion: 0.20
Nodes (10): dotenv, prisma, @prisma/adapter-pg, assert(), cookieJar(), main(), assert(), connectionString (+2 more)

### Community 23 - "Development Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, eslint-config-next, prisma, shadcn, tailwindcss, @tailwindcss/turbopack, tsx (+5 more)

### Community 24 - "Client API Key Store and Tests"
Cohesion: 0.27
Nodes (10): assert(), run(), ApiKeyProvider(), getServerSnapshot(), getStoredApiKey(), listeners, notify(), removeStoredApiKey() (+2 more)

### Community 25 - "Next.js Config and Auth Flow"
Cohesion: 0.24
Nodes (6): nextConfig, next, LoginPage(), Mode, SignOutButton(), authClient

### Community 26 - "Architecture Rules and Invariants"
Cohesion: 0.22
Nodes (5): Neon Auth Managed Better Auth Architecture, Neon Auth Trusted Domains Authorization, ResumeAI Product Vision and Scope, ResumeDocument Versioned JSON Schema, PostgreSQL Prisma Data Model

### Community 27 - "Integration Test Verification"
Cohesion: 0.33
Nodes (7): assert(), cleanupTestRows(), connectionString, main(), prisma, handleLoadSample(), createSampleResumeDocument()

### Community 28 - "Root Layout and Global Styling"
Cohesion: 0.32
Nodes (5): next-themes, metadata, poppins, RootLayout(), Toaster()

### Community 30 - "Project Documentation Architecture"
Cohesion: 0.29
Nodes (6): AGENTS.md Operational Guide, Custom Domain Setup Guide, Modular Monolith Application Architecture, PLAN.md Project Specification, ResumeAI Project Overview README, Full-Stack System Architecture

### Community 31 - "Design System UI Reference"
Cohesion: 0.38
Nodes (7): UI Reference Design Screenshot, Hero Section with Immersive Imagery and Mini Cards, Visual Timeline Itinerary with Image Highlights, Glassmorphism Contact and Lead Capture Form, Niseth Editorial Aesthetics and Layout Reference, Em-dash Structured Section Divider Pattern, Four-Column Feature Grid with Outlined Cards

### Community 32 - "Hyphenation Patching Utility"
Cohesion: 0.33
Nodes (3): fs, path, pkgPath

### Community 33 - "PDF Export API Route"
Cohesion: 0.67
Nodes (4): GET(), formatResumePdfFilename(), renderResumePdf(), getResumeForEditor()

### Community 34 - "Theme Color and Typography"
Cohesion: 0.60
Nodes (5): Split-Tone Inversion Palette Pairing, Theme Color & Typography Specification, Poppins Font Specification, Deep Forest Teal (#004643), Warm Linen Cream (#F0EDE5)

### Community 35 - "Template System Specifications"
Cohesion: 0.50
Nodes (4): Niseth Code Brand Design System, Multi-Template Rendering Engine, React-PDF Server-Side Rendering Engine, 6 Curated Resume Templates

### Community 36 - "Phase Roadmap and Milestones"
Cohesion: 0.50
Nodes (4): Phase 8 MVP Completion Status, Phase 10 AI Cover Letter Builder, Phase 9 Public Shareable Links and Analytics, 10-Phase Incremental Delivery Roadmap

### Community 37 - "ESLint Configuration"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 38 - "Dashboard E2E Smoke Tests"
Cohesion: 0.83
Nodes (3): assert(), main(), post()

## Knowledge Gaps
- **30 isolated node(s):** `@neon/env`, `@prisma/client`, `pg`, `react-dom`, `tw-animate-css` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 339 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Core Components` to `Resume Editor Form Controls`, `PDF Export API Route`, `Template Sheet Previews`, `React PDF Rendering Engine`, `Dashboard Workspace and Actions`, `Unit Test Verification Suite`, `Dashboard and Navigation Pages`, `Neon Infrastructure and SDK`, `Neon Auth Route Handlers`, `Dropdown Menu Component`, `Next.js Config and Auth Flow`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **What connects `@neon/env`, `@prisma/client`, `pg` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Core Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05130718954248366 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Resume Editor Form Controls` to `UI Core Components`, `Template Sheet Previews`, `Dashboard Workspace and Actions`, `Unit Test Verification Suite`, `Dashboard and Navigation Pages`, `Neon Infrastructure and SDK`, `Landing Page and Previews`, `Dropdown Menu Component`, `Next.js Config and Auth Flow`, `Root Layout and Global Styling`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `Resume Editor Form Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.08098495212038304 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Package Dependencies Manifest` to `Neon Infrastructure and SDK`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `CV Import and Parsing Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.051791629027401385 - nodes in this community are weakly interconnected._