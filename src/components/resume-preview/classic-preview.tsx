import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import { useLanguage } from "@/lib/i18n/context";
import {
  contactLine,
  dateRange,
  hasText,
  languageLabel,
} from "./preview-utils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 data-page-break="heading" className="mb-2 border-b border-neutral-300 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-700">
      {children}
    </h3>
  );
}

export function ClassicPreview({ document }: { document: ResumeDocument }) {
  const { isKhmer } = useLanguage();
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
    <div className="flex flex-col gap-5">
      <header data-page-break="item" className="text-center">
        {hasText(document.personal.photoUrl) && (
          <div className="mx-auto mb-3 size-20 overflow-hidden rounded-full border-2 border-neutral-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.personal.photoUrl}
              alt={document.personal.fullName || "Profile"}
              className="size-full object-cover object-top"
            />
          </div>
        )}
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-neutral-900">
          {document.personal.fullName.trim() || (isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your name")}
        </h1>
        {hasText(document.personal.roleApplied) && (
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-wider text-neutral-600">
            {document.personal.roleApplied.trim()}
          </p>
        )}
        {contact.length > 0 && (
          <p className="mt-1.5 text-[12px] text-neutral-500 break-words leading-relaxed">
            {contact.join("  ·  ")}
          </p>
        )}
      </header>

      {hasText(document.summary) && (
        <section data-page-break="item">
          <SectionHeading>{isKhmer ? "សេចក្តីសង្ខេប" : "Summary"}</SectionHeading>
          <p className="whitespace-pre-line text-neutral-800">
            {document.summary.trim()}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "បទពិសោធន៍ការងារ" : "Experience"}</SectionHeading>
          <div className="flex flex-col gap-3.5">
            {experience.map((entry) => {
              const bullets = entry.bullets.filter((b) => hasText(b.text));
              return (
                <div key={entry.id} data-page-break="item">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-semibold text-neutral-900">
                      {entry.role.trim() || (isKhmer ? "តួនាទី" : "Role")}
                      {hasText(entry.company) && (
                        <span className="font-normal text-neutral-600">
                          {" "}
                          · {entry.company.trim()}
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] text-neutral-500">
                      {dateRange(entry.startDate, entry.endDate, entry.current, isKhmer ? "km" : "en")}
                    </p>
                  </div>
                  {hasText(entry.location) && (
                    <p className="text-[12px] text-neutral-500">
                      {entry.location.trim()}
                    </p>
                  )}
                  {bullets.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-neutral-800">
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
          <SectionHeading>{isKhmer ? "ការអប់រំ" : "Education"}</SectionHeading>
          <div className="flex flex-col gap-2.5">
            {education.map((entry) => (
              <div key={entry.id} data-page-break="item">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold text-neutral-900">
                    {[entry.degree.trim(), entry.field.trim()]
                      .filter(Boolean)
                      .join(", ") || (isKhmer ? "ជំនាញសិក្សា" : "Program")}
                    {hasText(entry.school) && (
                      <span className="font-normal text-neutral-600">
                        {" "}
                        · {entry.school.trim()}
                      </span>
                    )}
                  </p>
                  <p className="text-[12px] text-neutral-500">
                    {dateRange(entry.startDate, entry.endDate, false, isKhmer ? "km" : "en")}
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
        <section data-page-break="item">
          <SectionHeading>{isKhmer ? "ជំនាញ" : "Skills"}</SectionHeading>
          <p className="text-neutral-800">
            {skills.map((entry) => entry.name.trim()).join("  ·  ")}
          </p>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <SectionHeading>{isKhmer ? "គម្រោង" : "Projects"}</SectionHeading>
          <div className="flex flex-col gap-3">
            {projects.map((entry) => {
              const bullets = entry.bullets.filter((b) => hasText(b.text));
              return (
                <div key={entry.id} data-page-break="item">
                  <p className="font-semibold text-neutral-900">
                    {entry.name.trim() || (isKhmer ? "គម្រោង" : "Project")}
                    {hasText(entry.url) && (
                      <span className="font-normal text-neutral-500">
                        {" "}
                        — {entry.url.trim()}
                      </span>
                    )}
                  </p>
                  {hasText(entry.description) && (
                    <p className="whitespace-pre-line text-neutral-800">
                      {entry.description.trim()}
                    </p>
                  )}
                  {bullets.length > 0 && (
                    <ul className="mt-0.5 list-disc pl-5 text-neutral-800">
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
          <SectionHeading>{isKhmer ? "វិញ្ញាបនបត្រ" : "Certifications"}</SectionHeading>
          <ul className="flex flex-col gap-1">
            {certifications.map((entry) => (
              <li
                key={entry.id}
                data-page-break="item"
                className="flex flex-wrap items-baseline justify-between gap-x-3"
              >
                <span>
                  <span className="font-semibold text-neutral-900">
                    {entry.name.trim() || (isKhmer ? "វិញ្ញាបនបត្រ" : "Certification")}
                  </span>
                  {hasText(entry.issuer) && (
                    <span className="text-neutral-600">
                      {" "}
                      · {entry.issuer.trim()}
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-neutral-500">
                  {entry.issueDate.trim()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {languages.length > 0 && (
        <section data-page-break="item">
          <SectionHeading>{isKhmer ? "ភាសា" : "Languages"}</SectionHeading>
          <p className="text-neutral-800">
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

