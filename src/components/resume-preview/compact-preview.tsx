import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import {
  contactItems,
  dateRange,
  hasText,
  languageLabel,
} from "./preview-utils";

function CompactHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 border-b border-neutral-300 pb-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-800">
      {children}
    </h3>
  );
}

export function CompactPreview({ document }: { document: ResumeDocument }) {
  const contacts = contactItems(document);
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
    <div className="flex flex-col gap-3 text-neutral-800">
      {/* Header */}
      <header className="border-b-2 border-neutral-900 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h1 className="font-display text-[24px] font-bold leading-tight tracking-tight text-neutral-950">
            {document.personal.fullName.trim() || "Your name"}
          </h1>
          {hasText(document.personal.roleApplied) && (
            <span className="text-[12px] font-semibold uppercase tracking-wider text-neutral-600">
              {document.personal.roleApplied.trim()}
            </span>
          )}
        </div>
      </header>

      {/* 2-Column Body */}
      <div className="flex gap-5">
        {/* Left Sidebar (32%) */}
        <aside className="flex w-[32%] shrink-0 flex-col gap-4 border-r border-neutral-200 pr-3.5">
          {hasText(document.personal.photoUrl) && (
            <div className="size-20 overflow-hidden rounded-xl border border-neutral-300 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.personal.photoUrl}
                alt={document.personal.fullName || "Profile"}
                className="size-full object-cover object-top"
              />
            </div>
          )}
          {contacts.length > 0 && (
            <section>
              <CompactHeading>Contact</CompactHeading>
              <div className="flex flex-col gap-1 text-[11px] text-neutral-600">
                {contacts.map((c, idx) => (
                  <span key={idx} className="break-all">
                    {c.label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <CompactHeading>Skills</CompactHeading>
              <ul className="flex flex-col gap-1 text-[11px] text-neutral-700">
                {skills.map((s) => (
                  <li key={s.id} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400">•</span>
                    <span>{s.name.trim()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <CompactHeading>Education</CompactHeading>
              <div className="flex flex-col gap-2">
                {education.map((entry) => (
                  <div key={entry.id} className="text-[11px]">
                    <p className="font-semibold text-neutral-900">
                      {[entry.degree.trim(), entry.field.trim()]
                        .filter(Boolean)
                        .join(", ") || "Degree"}
                    </p>
                    {hasText(entry.school) && (
                      <p className="text-neutral-600">{entry.school.trim()}</p>
                    )}
                    <p className="text-[10px] text-neutral-400">
                      {dateRange(entry.startDate, entry.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <CompactHeading>Certifications</CompactHeading>
              <div className="flex flex-col gap-1.5">
                {certifications.map((entry) => (
                  <div key={entry.id} className="text-[11px]">
                    <p className="font-semibold text-neutral-900">
                      {entry.name.trim() || "Certification"}
                    </p>
                    {hasText(entry.issuer) && (
                      <p className="text-neutral-600">{entry.issuer.trim()}</p>
                    )}
                    <p className="text-[10px] text-neutral-400">
                      {entry.issueDate.trim()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <CompactHeading>Languages</CompactHeading>
              <ul className="flex flex-col gap-1 text-[11px] text-neutral-700">
                {languages.map((l) => (
                  <li key={l.id} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400">•</span>
                    <span>{languageLabel(l.name, l.proficiency)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Right Main Column (68%) */}
        <main className="flex flex-1 flex-col gap-4">
          {hasText(document.summary) && (
            <section>
              <CompactHeading>Summary</CompactHeading>
              <p className="whitespace-pre-line text-[12px] leading-relaxed text-neutral-700">
                {document.summary.trim()}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <CompactHeading>Experience</CompactHeading>
              <div className="flex flex-col gap-3">
                {experience.map((entry) => {
                  const bullets = entry.bullets.filter((b) => hasText(b.text));
                  return (
                    <div key={entry.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <p className="text-[12px] font-semibold text-neutral-900">
                          {entry.role.trim() || "Role"}
                          {hasText(entry.company) && (
                            <span className="font-normal text-neutral-600">
                              {" "}
                              · {entry.company.trim()}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {dateRange(entry.startDate, entry.endDate, entry.current)}
                        </p>
                      </div>
                      {hasText(entry.location) && (
                        <p className="text-[11px] text-neutral-400">
                          {entry.location.trim()}
                        </p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-neutral-700">
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

          {projects.length > 0 && (
            <section>
              <CompactHeading>Projects</CompactHeading>
              <div className="flex flex-col gap-2.5">
                {projects.map((entry) => {
                  const bullets = entry.bullets.filter((b) => hasText(b.text));
                  return (
                    <div key={entry.id}>
                      <p className="text-[12px] font-semibold text-neutral-900">
                        {entry.name.trim() || "Project"}
                        {hasText(entry.url) && (
                          <span className="font-normal text-neutral-500">
                            {" "}
                            — {entry.url.trim()}
                          </span>
                        )}
                      </p>
                      {hasText(entry.description) && (
                        <p className="mt-0.5 whitespace-pre-line text-[11px] text-neutral-700">
                          {entry.description.trim()}
                        </p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="mt-0.5 list-disc pl-4 text-[11px] text-neutral-700">
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
        </main>
      </div>
    </div>
  );
}
