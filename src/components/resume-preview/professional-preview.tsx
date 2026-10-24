import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import { useLanguage } from "@/lib/i18n/context";
import {
  contactItems,
  dateRange,
  hasText,
  languageLabel,
} from "./preview-utils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div data-page-break="heading" className="mb-2.5 flex items-center justify-between border-b border-slate-300 pb-1">
      <h3 className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-slate-900">
        {children}
      </h3>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "CV";
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

export function ProfessionalPreview({ document }: { document: ResumeDocument }) {
  const { isKhmer } = useLanguage();
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
  const references = (document.references ?? []).filter(
    (entry) =>
      hasText(entry.name) ||
      hasText(entry.position) ||
      hasText(entry.workplace) ||
      hasText(entry.email) ||
      hasText(entry.phone)
  );

  const hasPhoto = hasText(document.personal.photoUrl);
  const initials = getInitials(document.personal.fullName);

  return (
    <div className="flex min-h-[1027px] flex-col gap-5 text-slate-800">
      {/* Executive Header with Profile Photo */}
      <header data-page-break="item" className="flex flex-col gap-4 border-b-2 border-slate-900 pb-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Photo or Initials Monogram */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-sm sm:size-24">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.personal.photoUrl}
              alt={document.personal.fullName || "Profile"}
              className="size-full object-cover object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-xl font-bold tracking-wider text-slate-400">
              {initials}
            </div>
          )}
        </div>

        {/* Name, Target Role, and Contact Row */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-slate-950">
            {document.personal.fullName.trim() || (isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your name")}
          </h1>

          {hasText(document.personal.roleApplied) && (
            <p className="mt-1 text-[14px] font-semibold tracking-wide text-blue-700">
              {document.personal.roleApplied.trim()}
            </p>
          )}

          {contacts.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-600">
              {contacts.map((c, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">·</span>}
                  {c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-600 hover:underline break-words"
                    >
                      {c.label}
                    </a>
                  ) : (
                    <span className="break-words">{c.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Summary / Executive Profile */}
      {hasText(document.summary) && (
        <section data-page-break="item">
          <SectionHeading>{isKhmer ? "សេចក្តីសង្ខេបប្រតិបត្តិ" : "Executive Summary"}</SectionHeading>
          <div className="rounded-r-lg border-l-3 border-blue-600 bg-slate-50/80 px-3.5 py-2.5">
            <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-700">
              {document.summary.trim()}
            </p>
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "បទពិសោធន៍ការងារ" : "Work Experience"}</SectionHeading>
          <div className="flex flex-col gap-4">
            {experience.map((entry) => (
              <div key={entry.id} data-page-break="item" className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-[13px] text-slate-950">
                      {entry.role.trim() || (isKhmer ? "មុខតំណែង" : "Role")}
                    </span>
                    {hasText(entry.company) && (
                      <span className="text-[12.5px] font-medium text-slate-700">
                        {isKhmer ? "នៅ " : "at "}{entry.company.trim()}
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-500">
                    {dateRange(entry.startDate, entry.endDate, entry.current, isKhmer ? "km" : "en")}
                    {hasText(entry.location) && (
                      <span className="ml-1.5 text-slate-400">
                        · {entry.location.trim()}
                      </span>
                    )}
                  </div>
                </div>

                {entry.bullets.filter((b) => hasText(b.text)).length > 0 && (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-700 marker:text-slate-400">
                    {entry.bullets
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

      {/* Education */}
      {education.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "ការអប់រំ" : "Education"}</SectionHeading>
          <div className="flex flex-col gap-3">
            {education.map((entry) => (
              <div key={entry.id} data-page-break="item" className="flex flex-col">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-[13px] text-slate-950">
                      {[entry.degree, entry.field].filter(hasText).join(isKhmer ? " ជំនាញ " : " in ") ||
                        (isKhmer ? "សញ្ញាបត្រ" : "Degree")}
                    </span>
                    {hasText(entry.school) && (
                      <span className="text-[12px] text-slate-700">
                        — {entry.school.trim()}
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-500">
                    {dateRange(entry.startDate, entry.endDate, false, isKhmer ? "km" : "en")}
                    {hasText(entry.location) && (
                      <span className="ml-1.5 text-slate-400">
                        · {entry.location.trim()}
                      </span>
                    )}
                  </div>
                </div>
                {hasText(entry.details) && (
                  <p className="mt-1 whitespace-pre-line text-[12px] text-slate-600">
                    {entry.details.trim()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "ជំនាញ និងសមត្ថភាពស្នូល" : "Skills & Core Competencies"}</SectionHeading>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill.id}
                data-page-break="item"
                className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-[11.5px] font-medium text-slate-800 ring-1 ring-inset ring-slate-300"
              >
                {skill.name.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "គម្រោងសំខាន់ៗ" : "Key Projects"}</SectionHeading>
          <div className="flex flex-col gap-3">
            {projects.map((proj) => (
              <div key={proj.id} data-page-break="item" className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-bold text-[13px] text-slate-950">
                    {proj.name.trim() || (isKhmer ? "គម្រោង" : "Project")}
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
                      className="text-[11.5px] text-blue-600 hover:underline"
                    >
                      {proj.url.replace(/^https?:\/\//i, "")}
                    </a>
                  )}
                </div>
                {hasText(proj.description) && (
                  <p className="text-[12px] text-slate-700">
                    {proj.description.trim()}
                  </p>
                )}
                {proj.bullets.filter((b) => hasText(b.text)).length > 0 && (
                  <ul className="list-disc space-y-0.5 pl-4 text-[12px] text-slate-600 marker:text-slate-400">
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "វិញ្ញាបនបត្រ" : "Certifications"}</SectionHeading>
          <div className="flex flex-col gap-2">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                data-page-break="item"
                className="flex flex-wrap items-baseline justify-between gap-x-2 text-[12px]"
              >
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-semibold text-slate-900">
                    {cert.name.trim()}
                  </span>
                  {hasText(cert.issuer) && (
                    <span className="text-slate-600">· {cert.issuer.trim()}</span>
                  )}
                </div>
                {hasText(cert.issueDate) && (
                  <span className="text-[11.5px] text-slate-500">
                    {cert.issueDate.trim()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section data-page-break="item">
          <SectionHeading>{isKhmer ? "ភាសា" : "Languages"}</SectionHeading>
          <p className="text-[12px] text-slate-700">
            {languages
              .map((l) => languageLabel(l.name, l.proficiency))
              .join("  ·  ")}
          </p>
        </section>
      )}

      {references.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "អ្នកយោង" : "References"}</SectionHeading>
          <div className="flex flex-col gap-2">
            {references.map((entry) => (
              <div key={entry.id} data-page-break="item" className="text-[12px]">
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-semibold text-slate-900">
                    {entry.name.trim()}
                  </span>
                  {hasText(entry.position) && (
                    <span className="text-slate-600">· {entry.position.trim()}</span>
                  )}
                </div>
                {[entry.workplace, entry.email, entry.phone]
                  .filter(hasText)
                  .length > 0 && (
                  <p className="text-[11.5px] text-slate-500">
                    {[entry.workplace, entry.email, entry.phone]
                      .filter(hasText)
                      .map((value) => value.trim())
                      .join("  ·  ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
