import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import {
  contactLine,
  dateRange,
  hasText,
  languageLabel,
} from "./preview-utils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="h-3 w-1 rounded-full bg-[#0095f6]" aria-hidden />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
        {children}
      </h3>
    </div>
  );
}

export function ModernPreview({ document }: { document: ResumeDocument }) {
  const contact = contactLine(document);
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
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Modern Header with Brand Accent Line */}
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="mb-2 h-1 w-8 rounded-full bg-[#0095f6]" aria-hidden />
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-slate-950">
            {document.personal.fullName.trim() || "Your name"}
          </h1>
          {hasText(document.personal.roleApplied) && (
            <p className="mt-1 text-[14px] font-semibold text-[#0095f6]">
              {document.personal.roleApplied.trim()}
            </p>
          )}
          {contact.length > 0 && (
            <p className="mt-2 text-[12px] text-slate-500">
              {contact.join("  ·  ")}
            </p>
          )}
        </div>
        {hasText(document.personal.photoUrl) && (
          <div className="size-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.personal.photoUrl}
              alt={document.personal.fullName || "Profile"}
              className="size-full object-cover"
            />
          </div>
        )}
      </header>

      {hasText(document.summary) && (
        <section>
          <SectionHeading>Summary</SectionHeading>
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">
            {document.summary.trim()}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionHeading>Experience</SectionHeading>
          <div className="flex flex-col gap-4">
            {experience.map((entry) => {
              const bullets = entry.bullets.filter((b) => hasText(b.text));
              return (
                <div key={entry.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold text-slate-900">
                      {entry.role.trim() || "Role"}
                      {hasText(entry.company) && (
                        <span className="font-normal text-slate-600">
                          {" "}
                          · {entry.company.trim()}
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] font-medium text-slate-500">
                      {dateRange(entry.startDate, entry.endDate, entry.current)}
                    </p>
                  </div>
                  {hasText(entry.location) && (
                    <p className="text-[12px] text-slate-400">
                      {entry.location.trim()}
                    </p>
                  )}
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-1 pl-1 text-[13px] leading-relaxed text-slate-700">
                      {bullets.map((bullet) => (
                        <li key={bullet.id} className="flex items-start gap-2">
                          <span className="select-none font-bold text-[#0095f6]" aria-hidden>
                            ›
                          </span>
                          <span>{bullet.text.trim()}</span>
                        </li>
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
          <div className="flex flex-col gap-3">
            {education.map((entry) => (
              <div key={entry.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold text-slate-900">
                    {[entry.degree.trim(), entry.field.trim()]
                      .filter(Boolean)
                      .join(", ") || "Program"}
                    {hasText(entry.school) && (
                      <span className="font-normal text-slate-600">
                        {" "}
                        · {entry.school.trim()}
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-slate-500">
                    {dateRange(entry.startDate, entry.endDate)}
                  </p>
                </div>
                {hasText(entry.details) && (
                  <p className="mt-0.5 whitespace-pre-line text-[12px] text-slate-500">
                    {entry.details.trim()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills as Modern Tags */}
      {skills.length > 0 && (
        <section>
          <SectionHeading>Skills</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((entry) => (
              <span
                key={entry.id}
                className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-0.5 text-[12px] font-medium text-slate-800"
              >
                {entry.name.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <SectionHeading>Projects</SectionHeading>
          <div className="flex flex-col gap-3.5">
            {projects.map((entry) => {
              const bullets = entry.bullets.filter((b) => hasText(b.text));
              return (
                <div key={entry.id}>
                  <p className="font-semibold text-slate-900">
                    {entry.name.trim() || "Project"}
                    {hasText(entry.url) && (
                      <span className="font-normal text-slate-500">
                        {" "}
                        — {entry.url.trim()}
                      </span>
                    )}
                  </p>
                  {hasText(entry.description) && (
                    <p className="mt-0.5 whitespace-pre-line text-[13px] text-slate-700">
                      {entry.description.trim()}
                    </p>
                  )}
                  {bullets.length > 0 && (
                    <ul className="mt-1 space-y-1 pl-1 text-[13px] text-slate-700">
                      {bullets.map((bullet) => (
                        <li key={bullet.id} className="flex items-start gap-2">
                          <span className="select-none font-bold text-[#0095f6]" aria-hidden>
                            ›
                          </span>
                          <span>{bullet.text.trim()}</span>
                        </li>
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
          <ul className="flex flex-col gap-1.5">
            {certifications.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline justify-between gap-x-3"
              >
                <span>
                  <span className="font-semibold text-slate-900">
                    {entry.name.trim() || "Certification"}
                  </span>
                  {hasText(entry.issuer) && (
                    <span className="text-slate-600">
                      {" "}
                      · {entry.issuer.trim()}
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-slate-500">
                  {entry.issueDate.trim()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section>
          <SectionHeading>Languages</SectionHeading>
          <p className="text-[13px] text-slate-700">
            {languages
              .map((entry) => languageLabel(entry.name, entry.proficiency))
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </section>
      )}
    </div>
  );
}

