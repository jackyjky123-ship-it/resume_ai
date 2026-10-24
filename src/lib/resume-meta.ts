/**
 * Resume metadata shared by the dashboard and editor.
 * Keep this module dependency-free so client bundles don't pull in Zod.
 */

export const TEMPLATE_IDS = [
  "classic",
  "modern",
  "compact",
  "professional",
  "editorial",
  "designer",
  "navy",
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  originalName: string;
  blurb: string;
  isRecommended?: boolean;
  category: "single" | "two-column";
  bestFor: string;
}[] = [
  {
    id: "classic",
    name: "Template 01",
    originalName: "Classic",
    blurb: "The timeless layout hiring managers expect. Clean and ATS-friendly.",
    category: "single",
    bestFor: "Barista, Retail, Administration & Entry-level",
  },
  {
    id: "modern",
    name: "Template 02",
    originalName: "Modern",
    blurb: "Calm typography with clean accents and modern aesthetic structure.",
    category: "single",
    bestFor: "General Customer Service, Sales & Hospitality",
  },
  {
    id: "compact",
    name: "Template 03",
    originalName: "Compact",
    blurb: "Fits a growing career with concise single-page density.",
    category: "single",
    bestFor: "Internships, Students & Career Switchers",
  },
  {
    id: "professional",
    name: "Template 04",
    originalName: "Professional",
    blurb: "Executive layout with photo, subtle tones, and balanced structure.",
    category: "single",
    bestFor: "Corporate, Management & Academic Roles",
  },
  {
    id: "editorial",
    name: "Template 05",
    originalName: "Editorial",
    blurb: "Clean two-column layout with split header, photo frame, and skill highlights.",
    isRecommended: true,
    category: "two-column",
    bestFor: "Creative, Tech, Engineering & Most Popular",
  },
  {
    id: "designer",
    name: "Template 06",
    originalName: "Designer",
    blurb: "Structured two-column layout with photo banner, vertical divider, and declaration.",
    isRecommended: true,
    category: "two-column",
    bestFor: "Design, Marketing, Portfolio & Best for Students",
  },
  {
    id: "navy",
    name: "Template 07",
    originalName: "Navy",
    blurb: "Contrasting navy sidebar with circular portrait, personal bio, and rounded capsule section banners.",
    isRecommended: true,
    category: "two-column",
    bestFor: "IT, Students, ASEAN Standard & Entry-to-Mid Roles",
  },
];

export const TEMPLATE_NAME: Record<TemplateId, string> = {
  classic: "Template 01",
  modern: "Template 02",
  compact: "Template 03",
  professional: "Template 04",
  editorial: "Template 05",
  designer: "Template 06",
  navy: "Template 07",
};

export const RESUME_SECTIONS = [
  "Contact",
  "Experience",
  "Education",
  "Skills",
  "Projects",
] as const;

export type SectionKey = (typeof RESUME_SECTIONS)[number];

import type { ResumeDocument } from "@/lib/validations/resume";

/** Serialized resume metadata used by dashboard cards. */
export type DashboardResume = {
  id: string;
  title: string;
  templateId: TemplateId;
  /** ISO timestamp — kept as a string so it crosses the RSC boundary cleanly. */
  createdAt: string;
  updatedAt: string;
  /** Which sections already hold real content — drives the story dashes. */
  filledSections: SectionKey[];
  /** Validated document content for live card preview. */
  content?: ResumeDocument;
};

export function formatRelativeTime(
  timestamp: string | number | Date,
  reference = Date.now(),
  locale: "en" | "km" = "en"
) {
  const value = new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.round((reference - value) / 60_000));
  if (locale === "km") {
    if (diffMinutes < 1) return "ទើបតែឥឡូវ";
    if (diffMinutes < 60) return `${diffMinutes} នាទីមុន`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;
    const diffWeeks = Math.round(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks} សប្តាហ៍មុន`;
    return new Date(value).toLocaleDateString("km-KH", {
      month: "short",
      day: "numeric",
    });
  }

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
