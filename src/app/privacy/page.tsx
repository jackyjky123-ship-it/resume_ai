import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Lock,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Notice & AI Practices — ResumeAI",
  description:
    "Learn how ResumeAI handles your resume data, our zero-training AI policy, secure session storage, and how your documents stay private.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-graphite hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Home
            </Link>
            <div className="h-4 w-px bg-hairline" />
            <Wordmark />
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
        <div className="border-b border-hairline pb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-3 py-1 text-xs font-semibold text-graphite">
            <Shield className="size-3.5 text-primary" />
            Security & Transparency
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Notice & AI Data Practices
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite sm:text-base">
            Last updated: October 2026. ResumeAI is built with privacy-first principles.
            We believe your career history is personal, and our architecture is designed
            so you remain in complete control of your data.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {/* Key Commitments */}
          <section className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-xl font-bold">
              <CheckCircle2 className="size-5 text-primary" />
              Our Core Privacy Commitments
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-hairline bg-neutral-50/70 p-4">
                <p className="text-sm font-semibold text-foreground">Zero AI Training</p>
                <p className="mt-1 text-xs leading-relaxed text-graphite">
                  Your resumes, bullet points, and job histories are never used to train public or proprietary AI foundation models.
                </p>
              </div>
              <div className="rounded-xl border border-hairline bg-neutral-50/70 p-4">
                <p className="text-sm font-semibold text-foreground">Minimal Payload AI</p>
                <p className="mt-1 text-xs leading-relaxed text-graphite">
                  When you request an AI bullet improvement or grammar check, only that specific line is transmitted — never your full identity.
                </p>
              </div>
              <div className="rounded-xl border border-hairline bg-neutral-50/70 p-4">
                <p className="text-sm font-semibold text-foreground">Isolated Session Ownership</p>
                <p className="mt-1 text-xs leading-relaxed text-graphite">
                  Every database read, update, and PDF export is verified against your server-side session. Cross-user leaks are physically prevented.
                </p>
              </div>
              <div className="rounded-xl border border-hairline bg-neutral-50/70 p-4">
                <p className="text-sm font-semibold text-foreground">Complete Deletion Right</p>
                <p className="mt-1 text-xs leading-relaxed text-graphite">
                  When you delete a resume or remove your account, the data is immediately cascade-purged from PostgreSQL. No dark archives.
                </p>
              </div>
            </div>
          </section>

          {/* Section: How AI is Used */}
          <section id="ai-practices" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="font-display text-xl font-bold">1. How Artificial Intelligence is Used</h2>
            </div>
            <p className="text-sm leading-relaxed text-graphite">
              ResumeAI uses Google Gemini API (via the official <code>@google/genai</code> SDK)
              exclusively for real-time user-directed assistance:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Action-Verb & Bullet Improvement:</strong> Transforming passive phrases into strong accomplishments without inventing metrics.
              </li>
              <li>
                <strong>Grammar & Proofreading:</strong> Identifying syntax, spelling, and phrasing errors in summaries and role descriptions.
              </li>
              <li>
                <strong>Grounded Suggestions:</strong> Extracting skills and framing summaries strictly from facts already stated in your work history.
              </li>
              <li>
                <strong>CV Import Assistance:</strong> Extracting structured sections from uploaded plain-text or PDF files when you choose to import.
              </li>
            </ul>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs leading-relaxed text-amber-900">
              <strong>Grounding Guarantee:</strong> Our AI prompts explicitly instruct the model never to invent employers, degrees, certifications, or unverified claims. All suggestions must be explicitly approved by you before being applied to your draft.
            </div>
          </section>

          {/* Section: Data Retention and Storage */}
          <section id="data-retention" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="size-5 text-primary" />
              <h2 className="font-display text-xl font-bold">2. Data Retention & Storage Architecture</h2>
            </div>
            <p className="text-sm leading-relaxed text-graphite">
              Your resume data is stored in a managed PostgreSQL instance provided by Neon Cloud, encrypted at rest and in transit via TLS:
            </p>
            <div className="space-y-3 text-sm text-foreground/85">
              <p>
                <strong>Authentication:</strong> Identity is managed through Neon Auth (Better Auth). Passwords are never stored in plain text and are hashed using industry-standard bcrypt/argon2 hashing algorithms.
              </p>
              <p>
                <strong>Resume Documents:</strong> Resume drafts are stored in structured JSONB columns adhering strictly to versioned schemas. Drafts are private to your user ID.
              </p>
              <p>
                <strong>AI Usage Accounting:</strong> To prevent denial-of-service and abuse of free tier resources, daily usage counts are tracked anonymously per user ID and reset automatically every 24 hours.
              </p>
            </div>
          </section>

          {/* Section: PDF Generation & Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              <h2 className="font-display text-xl font-bold">3. PDF Rendering & Export Security</h2>
            </div>
            <p className="text-sm leading-relaxed text-graphite">
              All PDF documents are generated entirely in server-side memory using <code>@react-pdf/renderer</code>. The generated PDF stream is piped directly to your HTTP response as a binary attachment:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-foreground/85">
              <li>PDF files are not stored on public disks, S3 buckets, or third-party CDNs.</li>
              <li>Exports do not contain hidden trackers, web beacons, or digital watermarks.</li>
              <li>Every PDF request requires a validated session cookie and ownership verification of the targeted document ID.</li>
            </ul>
          </section>

          {/* Section: User Rights and Deletion */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              <h2 className="font-display text-xl font-bold">4. Your Right to Delete</h2>
            </div>
            <p className="text-sm leading-relaxed text-graphite">
              You maintain 100% ownership over your data at all times:
            </p>
            <p className="text-sm leading-relaxed text-graphite">
              Deleting any resume from your dashboard immediately removes its records and cascade-deletes associated data. If you wish to delete your entire account, you may request full deletion from your profile or contact us, and all identity rows and stored documents will be erased.
            </p>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-16 border-t border-hairline pt-8">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white py-8 text-center text-xs text-graphite">
        <p>© 2026 ResumeAI · Transparent privacy and security policies.</p>
      </footer>
    </div>
  );
}
