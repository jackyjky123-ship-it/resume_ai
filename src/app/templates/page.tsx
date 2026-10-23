import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileDown,
  Printer,
  Sparkles,
} from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export const metadata: Metadata = {
  title: "Resume Templates Gallery — Niseth Code",
  description:
    "Explore our research-backed, beautifully formatted resume templates. Clean A4 layouts, ATS-friendly structures, selectable text, and watermark-free PDF exports.",
};

const TEMPLATE_GALLERY = [
  {
    id: "classic",
    name: "Classic",
    tagline: "The gold standard for ATS filters and corporate hiring managers.",
    category: "ATS-Friendly",
    badge: "Most Popular",
    color: "border-neutral-300 bg-neutral-50",
    features: [
      "Strict single-column flow with classic divider rules",
      "Maximum parsing compatibility with all corporate ATS engines",
      "Clean typography with standard bullet indentation",
      "Standard A4 page margins for international print and mail",
    ],
    recommendedFor: "New graduates, finance, consulting, legal, and government roles.",
    columns: "1 Column",
    accent: "Monochrome",
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Contemporary typography paired with a restrained indigo accent.",
    category: "Tech & Product",
    badge: "Recommended",
    color: "border-indigo-200 bg-indigo-50/40",
    features: [
      "Subtle indigo accent header and section dividers",
      "Modern font weighting for instant scannability",
      "Clean contact ribbon with icon-aligned links",
      "Balanced spacing optimized for 1 or 2 page resumes",
    ],
    recommendedFor: "Software engineers, product managers, data scientists, and startup roles.",
    columns: "1 Column",
    accent: "Refined Indigo",
  },
  {
    id: "compact",
    name: "Compact",
    tagline: "Dense, space-efficient layout engineered for longer careers.",
    category: "High Density",
    badge: "Dense Flow",
    color: "border-emerald-200 bg-emerald-50/40",
    features: [
      "Two-column split rail for contact and core technical skills",
      "Reduced vertical padding to fit 8+ years on fewer pages",
      "Tight bullet spacing without sacrificing readability",
      "Dedicated certification and language callouts",
    ],
    recommendedFor: "Senior engineers, DevOps leads, multi-role specialists, and 10+ year resumes.",
    columns: "2 Columns (Split Rail)",
    accent: "Emerald",
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Executive dark-band header with high-contrast, structured sections.",
    category: "Executive",
    badge: "Leadership",
    color: "border-slate-300 bg-slate-50/60",
    features: [
      "High-contrast slate header band creating instant authority",
      "Structured timeline layout for managerial and strategic roles",
      "Clear separation between responsibilities and key achievements",
      "Optimized for grayscale printing without loss of contrast",
    ],
    recommendedFor: "Directors, engineering managers, department heads, and executives.",
    columns: "1 Column with Executive Banner",
    accent: "Slate & Charcoal",
  },
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Sophisticated two-column layout with portrait frame and dashed skill grid.",
    category: "Creative & Design",
    badge: "Distinctive",
    color: "border-sky-200 bg-sky-50/40",
    features: [
      "Two-column asymmetric layout with dedicated sidebar",
      "Optional portrait photo slot with rounded frame",
      "Dashed skill highlights box for standout competencies",
      "Split-tone heading typography for an editorial feel",
    ],
    recommendedFor: "UX/UI designers, creative technologists, researchers, and media professionals.",
    columns: "2 Columns (Editorial Asymmetric)",
    accent: "Steel Blue",
  },
  {
    id: "designer",
    name: "Designer",
    tagline: "Structured two-column CV format with photo banner, vertical divider, and declaration.",
    category: "Design & Creative",
    badge: "Curated",
    color: "border-blue-200 bg-blue-50/40",
    features: [
      "ID-ready portrait photo box with bold accent header",
      "Clean vertical divider line between sidebar and main content",
      "Dedicated contact, skills, education, and language rail",
      "Integrated confirmation and declaration signature area",
    ],
    recommendedFor: "Designers, creative professionals, developers, and engineers.",
    columns: "2 Columns (Split with Divider)",
    accent: "Royal Blue & Charcoal",
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
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
          <div className="flex items-center gap-3">
            <LanguageToggle compact />
            <ThemeToggle compact />
            <Button asChild size="sm">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3.5 py-1 text-xs font-semibold text-graphite">
            <Sparkles className="size-3.5 text-primary" />
            5 Curated Templates · 100% Free
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pick a template built for serious review.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-graphite sm:text-lg">
            Every template renders to selectable, watermark-free A4 PDF documents. Switch
            templates at any moment in the editor with live preview and automatic autosave.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Printer className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Standard A4 Sizing</h2>
              <p className="mt-1 text-xs leading-relaxed text-graphite">
                Pixel-accurate pagination and wrapping. Never clipped or distorted on print.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">ATS Compatibility</h2>
              <p className="mt-1 text-xs leading-relaxed text-graphite">
                Semantic hierarchy and selectable text ensure automated screening software parses every section.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
              <FileDown className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Watermark-Free Export</h2>
              <p className="mt-1 text-xs leading-relaxed text-graphite">
                Export unlimited production-grade PDFs without logos, trial clocks, or payment gates.
              </p>
            </div>
          </div>
        </div>

        {/* Templates Showcase */}
        <section aria-label="Template options" className="mt-16 space-y-8">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Available Templates
            </h2>
            <span className="text-xs font-medium text-graphite">
              All included with your free account
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_GALLERY.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-2xl border border-hairline bg-white p-6 shadow-sm transition hover:border-foreground/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {t.category}
                  </span>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                    {t.badge}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">
                  {t.tagline}
                </p>

                <div className="my-5 border-t border-hairline pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-graphite">
                    Key Features
                  </p>
                  <ul className="mt-2.5 space-y-2 text-xs text-foreground/80">
                    {t.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 shrink-0 text-primary mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto border-t border-hairline pt-4">
                  <p className="text-[11px] text-graphite">
                    <strong className="text-foreground">Best for:</strong> {t.recommendedFor}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {t.columns} · {t.accent}
                    </span>
                    <Button asChild size="sm" variant="default">
                      <Link href={`/dashboard?template=${t.id}`}>
                        Create with {t.name}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action card */}
        <section className="mt-20 rounded-3xl border border-hairline bg-gradient-to-br from-white to-neutral-50 p-8 text-center sm:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start writing in under a minute.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-graphite">
            Sign up for free, fill in your background, or import your existing CV. You can
            switch between all 5 templates anytime without losing your work.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Create Free Resume
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/privacy">
                Read Privacy Notice
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white py-8 text-center text-xs text-graphite">
        <p>© 2026 Niseth Code · Free resume builder with live preview and watermark-free PDF exports.</p>
      </footer>
    </div>
  );
}
