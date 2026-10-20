/**
 * Resume metadata shared by the dashboard and editor.
 * Keep this module dependency-free so client bundles don't pull in Zod.
 */

export const TEMPLATE_IDS = ["classic", "modern", "compact", "professional", "editorial"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "The layout hiring managers expect." },
  { id: "modern", name: "Modern", blurb: "Calm typography with one quiet accent." },
  { id: "compact", name: "Compact", blurb: "Fits a growing career, stays readable." },
  {
    id: "professional",
    name: "Professional",
    blurb: "Executive layout with photo, subtle tones, and balanced structure.",
  },
  {
    id: "editorial",
    name: "Editorial",
    blurb: "Clean two-column layout with split header, portrait photo, and skill highlights box.",
  },
];

export const TEMPLATE_NAME: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  compact: "Compact",
  professional: "Professional",
  editorial: "Editorial",
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
  reference = Date.now()
) {
  const value = new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.round((reference - value) / 60_000));
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
