import {
  createResumeId,
  type ResumeDocument,
} from "@/lib/validations/resume";

export type ImportApplyMode = "merge" | "replace";

/**
 * Client-safe document transforms used after the user reviews an import.
 * Fresh IDs guarantee imported rows never collide with existing entries.
 */
export function withFreshIds(document: ResumeDocument): ResumeDocument {
  return {
    ...document,
    personal: { ...document.personal },
    experience: document.experience.map((entry) => ({
      ...entry,
      id: createResumeId(),
      bullets: entry.bullets.map((bullet) => ({
        id: createResumeId(),
        text: bullet.text,
      })),
    })),
    education: document.education.map((entry) => ({
      ...entry,
      id: createResumeId(),
    })),
    skills: document.skills.map((entry) => ({
      ...entry,
      id: createResumeId(),
    })),
    projects: document.projects.map((entry) => ({
      ...entry,
      id: createResumeId(),
      bullets: entry.bullets.map((bullet) => ({
        id: createResumeId(),
        text: bullet.text,
      })),
    })),
    certifications: document.certifications.map((entry) => ({
      ...entry,
      id: createResumeId(),
    })),
    languages: document.languages.map((entry) => ({
      ...entry,
      id: createResumeId(),
    })),
  };
}

function mergePersonal(
  current: ResumeDocument["personal"],
  imported: ResumeDocument["personal"]
): ResumeDocument["personal"] {
  return {
    fullName: current.fullName.trim() ? current.fullName : imported.fullName,
    email: current.email.trim() ? current.email : imported.email,
    phone: current.phone.trim() ? current.phone : imported.phone,
    location: current.location.trim() ? current.location : imported.location,
    website: current.website.trim() ? current.website : imported.website,
    linkedin: current.linkedin.trim() ? current.linkedin : imported.linkedin,
    github: current.github.trim() ? current.github : imported.github,
  };
}

function mergeSkills(
  current: ResumeDocument["skills"],
  imported: ResumeDocument["skills"]
) {
  const seen = new Set(
    current.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean)
  );
  const merged = [...current];
  for (const skill of imported) {
    const key = skill.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(skill);
  }
  return merged.slice(0, 50);
}

function mergeLanguages(
  current: ResumeDocument["languages"],
  imported: ResumeDocument["languages"]
) {
  const seen = new Set(
    current.map(
      (language) =>
        `${language.name.trim().toLowerCase()}|${language.proficiency
          .trim()
          .toLowerCase()}`
    )
  );
  const merged = [...current];
  for (const language of imported) {
    const key = `${language.name.trim().toLowerCase()}|${language.proficiency
      .trim()
      .toLowerCase()}`;
    if (key === "|" || seen.has(key)) continue;
    seen.add(key);
    merged.push(language);
  }
  return merged.slice(0, 15);
}

export function mergeResumeDocuments(
  current: ResumeDocument,
  imported: ResumeDocument
): ResumeDocument {
  const fresh = withFreshIds(imported);
  return {
    version: 1,
    personal: mergePersonal(current.personal, fresh.personal),
    summary: current.summary.trim() ? current.summary : fresh.summary,
    experience: [...current.experience, ...fresh.experience].slice(0, 20),
    education: [...current.education, ...fresh.education].slice(0, 10),
    skills: mergeSkills(current.skills, fresh.skills),
    projects: [...current.projects, ...fresh.projects].slice(0, 20),
    certifications: [...current.certifications, ...fresh.certifications].slice(
      0,
      20
    ),
    languages: mergeLanguages(current.languages, fresh.languages),
  };
}

export function hasImportableContent(document: ResumeDocument): boolean {
  const personal = Object.values(document.personal).some((value) =>
    value.trim()
  );
  return Boolean(
    personal ||
      document.summary.trim() ||
      document.experience.length > 0 ||
      document.education.length > 0 ||
      document.skills.length > 0 ||
      document.projects.length > 0 ||
      document.certifications.length > 0 ||
      document.languages.length > 0
  );
}
