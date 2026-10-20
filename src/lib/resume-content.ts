import { RESUME_SECTIONS, type SectionKey } from "@/lib/resume-meta";
import type { ResumeDocument } from "@/lib/validations/resume";

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

/** Which dashboard sections already hold real content. */
export function filledSectionsOf(content: ResumeDocument): SectionKey[] {
  const filled = new Set<SectionKey>();
  const { personal } = content;

  if (
    hasText(personal.fullName) ||
    hasText(personal.roleApplied) ||
    hasText(personal.email) ||
    hasText(personal.phone) ||
    hasText(personal.location) ||
    hasText(personal.website) ||
    hasText(personal.linkedin) ||
    hasText(personal.github) ||
    hasText(personal.photoUrl)
  ) {
    filled.add("Contact");
  }

  if (
    content.experience.some(
      (entry) =>
        hasText(entry.company) ||
        hasText(entry.role) ||
        entry.bullets.some((bullet) => hasText(bullet.text))
    )
  ) {
    filled.add("Experience");
  }

  if (content.education.some((entry) => hasText(entry.school) || hasText(entry.degree))) {
    filled.add("Education");
  }

  if (content.skills.some((entry) => hasText(entry.name))) {
    filled.add("Skills");
  }

  if (
    content.projects.some(
      (entry) =>
        hasText(entry.name) ||
        hasText(entry.description) ||
        entry.bullets.some((bullet) => hasText(bullet.text))
    )
  ) {
    filled.add("Projects");
  }

  return RESUME_SECTIONS.filter((section) => filled.has(section));
}
