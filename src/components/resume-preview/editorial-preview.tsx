import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import { dateRange, hasText } from "./preview-utils";

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b-2 border-slate-900 pb-0.5">
      <h3 className="font-display text-[14px] font-bold tracking-tight text-slate-950">
        {children}
      </h3>
    </div>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b-2 border-slate-900 pb-0.5">
      <h3 className="font-display text-[15px] font-bold tracking-tight text-slate-950">
        {children}
      </h3>
    </div>
  );
}

function splitName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { first: "Your", last: "Name" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0] ?? "", last: "" };
  }
  const last = parts.pop() ?? "";
  const first = parts.join(" ");
  return { first, last };
}

/** Vector avatar silhouette matching the reference portrait illustration */
function AvatarSilhouette() {
  return (
    <svg
      viewBox="0 0 160 140"
      className="size-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="160" height="140" fill="#d1d5db" />
      {/* Head and neck base */}
      <path
        d="M80 32C69 32 61 41 61 53C61 65 69 74 80 74C91 74 99 65 99 53C99 41 91 32 80 32Z"
        fill="#f8fafc"
      />
      {/* Neck */}
      <path d="M74 72H86V88H74V72Z" fill="#f8fafc" />
      {/* Hair graphic with subtle side part and texture */}
      <path
        d="M80 25C65 25 56 36 56 50C56 54 57 58 59 62C61 58 63 52 66 49C70 45 77 44 83 46C89 48 94 44 97 41C99 44 100 48 100 52C102 48 103 44 103 40C103 31 93 25 80 25Z"
        fill="#475569"
      />
      {/* Shoulders / bust */}
      <path
        d="M38 140C38 108 55 94 80 94C105 94 122 108 122 140H38Z"
        fill="#64748b"
      />
    </svg>
  );
}

export function EditorialPreview({ document }: { document: ResumeDocument }) {
  const { first, last } = splitName(document.personal.fullName);
  const hasPhoto = hasText(document.personal.photoUrl);

  const experience = document.experience.filter(
    (entry) =>
      hasText(entry.company) ||
      hasText(entry.role) ||
      entry.bullets.some((b) => hasText(b.text))
  );
  const education = document.education.filter(
    (entry) =>
      hasText(entry.school) || hasText(entry.degree) || hasText(entry.field)
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

  return (
    <div className="flex gap-8 text-slate-800">
      {/* Left Sidebar (35% width) */}
      <aside className="flex w-[35%] shrink-0 flex-col gap-5">
        {/* Name Header: Two-tone split */}
        <div>
          <h1 className="font-display text-[28px] font-black leading-[1.08] tracking-tight text-slate-950 sm:text-[32px]">
            <span className="block">{first}</span>
            {last && <span className="block text-[#3b6998]">{last}</span>}
          </h1>
          {hasText(document.personal.roleApplied) && (
            <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-slate-600">
              {document.personal.roleApplied.trim()}
            </p>
          )}
        </div>

        {/* Profile Photo / Avatar Frame */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xs border border-slate-300 bg-slate-200 shadow-2xs">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.personal.photoUrl}
              alt={document.personal.fullName || "Profile"}
              className="size-full object-cover"
            />
          ) : (
            <AvatarSilhouette />
          )}
        </div>

        {/* Contact Section */}
        {(hasText(document.personal.location) ||
          hasText(document.personal.phone) ||
          hasText(document.personal.email) ||
          hasText(document.personal.linkedin) ||
          hasText(document.personal.website) ||
          hasText(document.personal.github)) && (
          <section>
            <SidebarHeading>Contact</SidebarHeading>
            <div className="flex flex-col gap-2.5 text-[11.5px]">
              {hasText(document.personal.location) && (
                <div>
                  <span className="block font-bold text-slate-950">Address:</span>
                  <span className="text-slate-700 leading-snug">
                    {document.personal.location.trim()}
                  </span>
                </div>
              )}

              {hasText(document.personal.phone) && (
                <div>
                  <span className="block font-bold text-slate-950">Phone:</span>
                  <a
                    href={`tel:${document.personal.phone.trim()}`}
                    className="text-slate-700 hover:text-[#3b6998] leading-snug"
                  >
                    {document.personal.phone.trim()}
                  </a>
                </div>
              )}

              {hasText(document.personal.email) && (
                <div>
                  <span className="block font-bold text-slate-950">Email:</span>
                  <a
                    href={`mailto:${document.personal.email.trim()}`}
                    className="break-all text-slate-700 hover:text-[#3b6998] leading-snug"
                  >
                    {document.personal.email.trim()}
                  </a>
                </div>
              )}

              {hasText(document.personal.linkedin) && (
                <div>
                  <span className="block font-bold text-slate-950">LinkedIn:</span>
                  <a
                    href={
                      document.personal.linkedin.startsWith("http")
                        ? document.personal.linkedin
                        : `https://${document.personal.linkedin}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-slate-700 hover:text-[#3b6998] leading-snug"
                  >
                    {document.personal.linkedin
                      .trim()
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "linkedin.com/")
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\//i, "linkedin.com/")}
                  </a>
                </div>
              )}

              {hasText(document.personal.website) && (
                <div>
                  <span className="block font-bold text-slate-950">Website:</span>
                  <a
                    href={
                      document.personal.website.startsWith("http")
                        ? document.personal.website
                        : `https://${document.personal.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-slate-700 hover:text-[#3b6998] leading-snug"
                  >
                    {document.personal.website.trim().replace(/^https?:\/\//i, "")}
                  </a>
                </div>
              )}

              {hasText(document.personal.github) && (
                <div>
                  <span className="block font-bold text-slate-950">GitHub:</span>
                  <a
                    href={
                      document.personal.github.startsWith("http")
                        ? document.personal.github
                        : `https://${document.personal.github}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-slate-700 hover:text-[#3b6998] leading-snug"
                  >
                    {document.personal.github
                      .trim()
                      .replace(/^https?:\/\/(www\.)?github\.com\//i, "github.com/")}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Languages Section */}
        {languages.length > 0 && (
          <section>
            <SidebarHeading>Languages</SidebarHeading>
            <div className="flex flex-col gap-1 text-[11.5px] font-medium text-slate-800">
              {languages.map((l) => (
                <div key={l.id}>
                  {l.name.trim()}
                  {hasText(l.proficiency) ? ` – ${l.proficiency.trim()}` : ""}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects / Additional Sidebar Section */}
        {projects.length > 0 && (
          <section>
            <SidebarHeading>Key Projects</SidebarHeading>
            <div className="flex flex-col gap-3 text-[11.5px]">
              {projects.map((proj) => (
                <div key={proj.id} className="flex flex-col">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-bold text-slate-950">
                      {proj.name.trim() || "Project"}
                    </span>
                    {hasText(proj.url) && (
                      <a
                        href={
                          proj.url.startsWith("http")
                            ? proj.url
                            : `https://${proj.url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#3b6998] hover:underline"
                      >
                        Link
                      </a>
                    )}
                  </div>
                  {hasText(proj.description) && (
                    <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
                      {proj.description.trim()}
                    </p>
                  )}
                  {proj.bullets.filter((b) => hasText(b.text)).length > 0 && (
                    <ul className="mt-1 list-disc pl-3.5 space-y-0.5 text-[10.5px] text-slate-600">
                      {proj.bullets
                        .filter((b) => hasText(b.text))
                        .map((b) => (
                          <li key={b.id}>{b.text.trim()}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Right Main Column (65% width) */}
      <main className="flex flex-1 flex-col gap-5 min-w-0">
        {/* Summary Section */}
        {hasText(document.summary) && (
          <section>
            <MainHeading>Summary</MainHeading>
            <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-slate-700">
              {document.summary.trim()}
            </p>
          </section>
        )}

        {/* Skill Highlights Section (Dashed border box with 2-column bullets) */}
        {skills.length > 0 && (
          <section>
            <h3 className="mb-2 font-display text-[15px] font-bold tracking-tight text-slate-950">
              Skill Highlights
            </h3>
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/50 p-3.5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-slate-800">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-start gap-2">
                    <span className="font-bold text-slate-950 select-none">•</span>
                    <span className="font-medium">{skill.name.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <section>
            <MainHeading>Experience</MainHeading>
            <div className="flex flex-col gap-4">
              {experience.map((entry) => {
                const bullets = entry.bullets.filter((b) => hasText(b.text));
                const dates = dateRange(
                  entry.startDate,
                  entry.endDate,
                  entry.current
                );
                return (
                  <div key={entry.id} className="flex flex-col">
                    {/* Line 1: Role - Dates */}
                    <div className="text-[12.5px] font-bold text-slate-950">
                      <span>{entry.role.trim() || "Role"}</span>
                      {dates && (
                        <span className="font-normal text-slate-700">
                          {" - "}
                          {dates}
                        </span>
                      )}
                    </div>

                    {/* Line 2: Company, Location */}
                    {(hasText(entry.company) || hasText(entry.location)) && (
                      <div className="mt-0.5 text-[11.5px] font-semibold text-slate-800">
                        {[entry.company.trim(), entry.location.trim()]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}

                    {/* Bullets */}
                    {bullets.length > 0 && (
                      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-700 marker:text-slate-900">
                        {bullets.map((b) => (
                          <li key={b.id}>{b.text.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education Section */}
        {education.length > 0 && (
          <section>
            <MainHeading>Education</MainHeading>
            <div className="flex flex-col gap-3">
              {education.map((entry) => {
                const dates = dateRange(entry.startDate, entry.endDate);
                return (
                  <div key={entry.id} className="flex flex-col text-[12px]">
                    <div className="text-slate-950">
                      {hasText(entry.degree) && (
                        <span className="font-medium">
                          {entry.degree.trim()}
                          {hasText(entry.field) ? ": " : ""}
                        </span>
                      )}
                      {hasText(entry.field) && (
                        <span className="font-bold">{entry.field.trim()}</span>
                      )}
                      {dates && (
                        <span className="font-normal text-slate-600">
                          {" - "}
                          {dates}
                        </span>
                      )}
                    </div>
                    {(hasText(entry.school) || hasText(entry.location)) && (
                      <div className="mt-0.5 text-[11.5px] font-semibold text-slate-800">
                        {[entry.school.trim(), entry.location.trim()]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {hasText(entry.details) && (
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                        {entry.details.trim()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {certifications.length > 0 && (
          <section>
            <MainHeading>Certifications</MainHeading>
            <div className="flex flex-col gap-2">
              {certifications.map((entry) => (
                <div
                  key={entry.id}
                  className="text-[11.5px] leading-snug text-slate-800"
                >
                  <span className="font-bold text-slate-950">
                    {entry.name.trim()}
                  </span>
                  {hasText(entry.issuer) && (
                    <span className="text-slate-700">: {entry.issuer.trim()}</span>
                  )}
                  {hasText(entry.issueDate) && (
                    <span className="font-normal text-slate-500">
                      {" - "}
                      {entry.issueDate.trim()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
