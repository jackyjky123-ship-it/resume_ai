/**
 * Hardcoded sample data for the dashboard UI preview.
 *
 * The dashboard is presentation-only for now: every resume below is invented
 * and lives in the browser tab's memory. When Phase 4 wires the real
 * repository, delete this file and feed `DashboardResume` rows from Prisma.
 */

export type TemplateId = "classic" | "modern" | "compact";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "The layout hiring managers expect." },
  { id: "modern", name: "Modern", blurb: "Calm typography with one quiet accent." },
  { id: "compact", name: "Compact", blurb: "Fits a growing career, stays readable." },
];

export const TEMPLATE_NAME: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  compact: "Compact",
};

export const RESUME_SECTIONS = [
  "Contact",
  "Experience",
  "Education",
  "Skills",
  "Projects",
] as const;

export type SectionKey = (typeof RESUME_SECTIONS)[number];

/** Mirrors the Prisma `Resume` list shape, plus the five editor sections. */
export type DashboardResume = {
  id: string;
  title: string;
  templateId: TemplateId;
  createdAt: number;
  updatedAt: number;
  /** Which sections already hold real content — drives the story dashes. */
  filledSections: SectionKey[];
};

const now = Date.now();
const minutesAgo = (m: number) => now - m * 60_000;
const hoursAgo = (h: number) => now - h * 3_600_000;
const daysAgo = (d: number) => now - d * 86_400_000;

export const INITIAL_RESUMES: DashboardResume[] = [
  {
    id: "res_frontend_fall26",
    title: "Frontend internship — Fall 2026",
    templateId: "modern",
    createdAt: daysAgo(12),
    updatedAt: minutesAgo(26),
    filledSections: ["Contact", "Experience", "Education", "Skills", "Projects"],
  },
  {
    id: "res_draft_summer27",
    title: "Draft — summer 2027",
    templateId: "modern",
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(2),
    filledSections: ["Contact"],
  },
  {
    id: "res_ta_ridgeview",
    title: "TA application — Ridgeview Code Lab",
    templateId: "classic",
    createdAt: daysAgo(21),
    updatedAt: daysAgo(2),
    filledSections: ["Contact", "Experience", "Education"],
  },
  {
    id: "res_general_backup",
    title: "General applications — backup",
    templateId: "classic",
    createdAt: daysAgo(49),
    updatedAt: daysAgo(9),
    filledSections: ["Contact", "Experience", "Education", "Skills"],
  },
  {
    id: "res_bloom_spotlight",
    title: "Bloom — project spotlight",
    templateId: "compact",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(19),
    filledSections: ["Contact", "Education", "Skills", "Projects"],
  },
];

/** Fake profile counters. The real app reads these from AI usage records. */
export const MOCK_STATS = { exports: 6, suggestionsAccepted: 18 };

export function formatRelativeTime(timestamp: number, reference = Date.now()) {
  const diffMinutes = Math.max(0, Math.round((reference - timestamp) / 60_000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
