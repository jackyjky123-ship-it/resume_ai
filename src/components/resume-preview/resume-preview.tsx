import type { ResumeDocument } from "@/lib/validations/resume";

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function dateRange(start: string, end: string, current = false) {
  const endLabel = current ? "Present" : end.trim();
  return [start.trim(), endLabel].filter(Boolean).join(" – ");
}

function contactLine(document: ResumeDocument) {
  const { personal } = document;
  return [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(hasText);
}

function languageLabel(name: string, proficiency: string) {
  const trimmedName = name.trim();
  const trimmedLevel = proficiency.trim();
  if (trimmedName && trimmedLevel) return `${trimmedName} (${trimmedLevel})`;
  return trimmedName || trimmedLevel;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-700">
      {children}
    </h3>
  );
}

/**
 * Classic live preview — the first of the three templates.
 * Modern and Compact layouts arrive with the PDF work in Phase 6.
 */
export function ResumePreview({ document }: { document: ResumeDocument }) {
  const contact = contactLine(document);
  const experience = document.experience.filter(
    (entry) => hasText(entry.company) || hasText(entry.role) || entry.bullets.some((b) => hasText(b.text))
  );
  const education = document.education.filter(
    (entry) => hasText(entry.school) || hasText(entry.degree) || hasText(entry.field)
  );
  const skills = document.skills.filter((entry) => hasText(entry.name));
  const projects = document.projects.filter(
    (entry) =>
      hasText(entry.name) ||
      hasText(entry.description) ||
      entry.bullets.some((b) => hasText(b.text))
  );
  const certifications = document.certifications.filter(
    (entry) => hasText(entry.name) || hasText(entry.issuer)
  );
  const languages = document.languages.filter((entry) => hasText(entry.name));

  const isBlank =
    !hasText(document.personal.fullName) &&
    contact.length === 0 &&
    !hasText(document.summary) &&
    experience.length === 0 &&
    education.length === 0 &&
    skills.length === 0 &&
    projects.length === 0 &&
    certifications.length === 0 &&
    languages.length === 0;

  return (
    <article
      aria-label="Live resume preview"
      className="mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white px-10 py-12 text-[13px] leading-[1.55] text-neutral-800 shadow-[0_30px_70px_-40px_rgba(38,38,38,0.45)] ring-1 ring-black/5 sm:px-14"
    >
      {isBlank ? (
        <div className="m-auto max-w-xs text-center text-sm text-neutral-400">
          <p className="font-semibold text-neutral-500">Your preview starts here.</p>
          <p className="mt-1.5">
            Fill in any field and it appears on this page immediately.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <header className="text-center">
            <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-neutral-900">
              {document.personal.fullName.trim() || "Your name"}
            </h1>
            {contact.length > 0 && (
              <p className="mt-1.5 text-[12px] text-neutral-500">{contact.join("  ·  ")}</p>
            )}
          </header>

          {hasText(document.summary) && (
            <section>
              <SectionHeading>Summary</SectionHeading>
              <p className="whitespace-pre-line">{document.summary.trim()}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionHeading>Experience</SectionHeading>
              <div className="flex flex-col gap-3.5">
                {experience.map((entry) => {
                  const bullets = entry.bullets.filter((b) => hasText(b.text));
                  return (
                    <div key={entry.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-semibold text-neutral-900">
                          {entry.role.trim() || "Role"}
                          {hasText(entry.company) && (
                            <span className="font-normal text-neutral-600"> · {entry.company.trim()}</span>
                          )}
                        </p>
                        <p className="text-[12px] text-neutral-500">
                          {dateRange(entry.startDate, entry.endDate, entry.current)}
                        </p>
                      </div>
                      {hasText(entry.location) && (
                        <p className="text-[12px] text-neutral-500">{entry.location.trim()}</p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                          {bullets.map((bullet) => (
                            <li key={bullet.id}>{bullet.text.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionHeading>Education</SectionHeading>
              <div className="flex flex-col gap-2.5">
                {education.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-neutral-900">
                        {[entry.degree.trim(), entry.field.trim()].filter(Boolean).join(", ") ||
                          "Program"}
                        {hasText(entry.school) && (
                          <span className="font-normal text-neutral-600"> · {entry.school.trim()}</span>
                        )}
                      </p>
                      <p className="text-[12px] text-neutral-500">
                        {dateRange(entry.startDate, entry.endDate)}
                      </p>
                    </div>
                    {hasText(entry.details) && (
                      <p className="whitespace-pre-line text-[12px] text-neutral-600">
                        {entry.details.trim()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SectionHeading>Skills</SectionHeading>
              <p>{skills.map((entry) => entry.name.trim()).join("  ·  ")}</p>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionHeading>Projects</SectionHeading>
              <div className="flex flex-col gap-3">
                {projects.map((entry) => {
                  const bullets = entry.bullets.filter((b) => hasText(b.text));
                  return (
                    <div key={entry.id}>
                      <p className="font-semibold text-neutral-900">
                        {entry.name.trim() || "Project"}
                        {hasText(entry.url) && (
                          <span className="font-normal text-neutral-500"> — {entry.url.trim()}</span>
                        )}
                      </p>
                      {hasText(entry.description) && (
                        <p className="whitespace-pre-line">{entry.description.trim()}</p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="mt-0.5 list-disc pl-5">
                          {bullets.map((bullet) => (
                            <li key={bullet.id}>{bullet.text.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <SectionHeading>Certifications</SectionHeading>
              <ul className="flex flex-col gap-1">
                {certifications.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span>
                      <span className="font-semibold text-neutral-900">
                        {entry.name.trim() || "Certification"}
                      </span>
                      {hasText(entry.issuer) && (
                        <span className="text-neutral-600"> · {entry.issuer.trim()}</span>
                      )}
                    </span>
                    <span className="text-[12px] text-neutral-500">{entry.issueDate.trim()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <SectionHeading>Languages</SectionHeading>
              <p>
                {languages
                  .map((entry) => languageLabel(entry.name, entry.proficiency))
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
