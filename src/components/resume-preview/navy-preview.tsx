import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import { useLanguage } from "@/lib/i18n/context";
import { dateRange, formatTelegram, hasText } from "./preview-utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CV";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "CV";
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      data-page-break="heading"
      className="text-[11.5px] font-bold tracking-[0.16em] uppercase text-white border-b border-white/40 pb-1 mb-2.5"
    >
      {children}
    </h3>
  );
}

function PillBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-page-break="heading"
      className="w-full rounded-full bg-[#1E2532] py-1.5 px-4 text-center mb-2.5 shadow-xs"
    >
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white leading-none">
        {children}
      </h3>
    </div>
  );
}

export function NavyPreview({ document }: { document: ResumeDocument }) {
  const { isKhmer } = useLanguage();
  const { personal } = document;
  const fullName =
    personal.fullName.trim() || (isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your name");
  const initials = getInitials(personal.fullName);
  const hasPhoto = hasText(personal.photoUrl);

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
  const languages = document.languages.filter((entry) => hasText(entry.name));
  const references = (document.references ?? []).filter(
    (entry) =>
      hasText(entry.name) ||
      hasText(entry.position) ||
      hasText(entry.workplace) ||
      hasText(entry.email) ||
      hasText(entry.phone)
  );
  const certifications = document.certifications.filter(
    (entry) => hasText(entry.name) || hasText(entry.issuer)
  );

  const hasAnyContact =
    hasText(personal.phone) ||
    hasText(personal.email) ||
    hasText(personal.telegram) ||
    hasText(personal.website) ||
    hasText(personal.linkedin) ||
    hasText(personal.github);

  const hasPersonalInfo =
    hasText(personal.fullName) ||
    hasText(personal.gender) ||
    hasText(personal.nationality) ||
    hasText(personal.dateOfBirth) ||
    hasText(personal.placeOfBirth) ||
    hasText(personal.location);

  // Strengths list: only show strengths the user actually entered.
  const rawStrengths = personal.strengths?.trim();
  const strengthsList = rawStrengths
    ? rawStrengths
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Split skills into two columns for the 2-column layout matching the reference
  const half = Math.ceil(skills.length / 2);
  const skillsCol1 = skills.slice(0, half);
  const skillsCol2 = skills.slice(half);

  return (
    <div className="flex min-h-[1123px] font-sans text-neutral-800">
      {/* ============================================================== */}
      {/* LEFT SIDEBAR: Solid Dark Navy (#1E2532)                        */}
      {/* ============================================================== */}
      <aside className="w-[36%] shrink-0 bg-[#1E2532] text-white p-7 flex flex-col gap-6">
        {/* Profile Avatar with Sky/Cyan Ring */}
        <div data-page-break="item" className="flex justify-center pt-1 pb-2">
          <div className="relative size-28 overflow-hidden rounded-full border-4 border-[#00A3E0] bg-[#00A3E0] shadow-md flex items-center justify-center">
            {hasPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={personal.photoUrl}
                alt={fullName}
                className="size-full object-cover object-top"
              />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-white select-none">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* CONTACT SECTION */}
        {hasAnyContact && (
          <section data-page-break="item">
            <SidebarHeading>{isKhmer ? "ទំនាក់ទំនង" : "CONTACT"}</SidebarHeading>
            <ul className="flex flex-col gap-1.5 text-[11px] text-white/95">
              {hasText(personal.phone) && (
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{isKhmer ? "ទូរស័ព្ទ" : "Phone"} :</span>
                  <span>{personal.phone.trim()}</span>
                </li>
              )}
              {hasText(personal.email) && (
                <li className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-[#00A3E0] select-none shrink-0">•</span>
                  <span className="font-semibold shrink-0">{isKhmer ? "អ៊ីមែល" : "Email"} :</span>
                  <a
                    href={`mailto:${personal.email.trim()}`}
                    className="truncate hover:underline text-white"
                  >
                    {personal.email.trim()}
                  </a>
                </li>
              )}
              {hasText(personal.telegram) && (
                <li className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-[#00A3E0] select-none shrink-0">•</span>
                  <span className="font-semibold shrink-0">Telegram :</span>
                  <a
                    href={formatTelegram(personal.telegram).url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-white"
                  >
                    {personal.telegram.trim().startsWith("@")
                      ? personal.telegram.trim()
                      : `@${formatTelegram(personal.telegram).label.replace("t.me/", "")}`}
                  </a>
                </li>
              )}
              {hasText(personal.website) && (
                <li className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-[#00A3E0] select-none shrink-0">•</span>
                  <span className="font-semibold shrink-0">Website :</span>
                  <a
                    href={
                      personal.website.startsWith("http")
                        ? personal.website
                        : `https://${personal.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-white"
                  >
                    {personal.website.trim().replace(/^https?:\/\//i, "")}
                  </a>
                </li>
              )}
              {hasText(personal.linkedin) && (
                <li className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-[#00A3E0] select-none shrink-0">•</span>
                  <span className="font-semibold shrink-0">LinkedIn :</span>
                  <a
                    href={
                      personal.linkedin.startsWith("http")
                        ? personal.linkedin
                        : `https://${personal.linkedin}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-white"
                  >
                    {personal.linkedin
                      .trim()
                      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")}
                  </a>
                </li>
              )}
              {hasText(personal.github) && (
                <li className="flex items-baseline gap-2 min-w-0">
                  <span className="font-bold text-[#00A3E0] select-none shrink-0">•</span>
                  <span className="font-semibold shrink-0">GitHub :</span>
                  <a
                    href={
                      personal.github.startsWith("http")
                        ? personal.github
                        : `https://${personal.github}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-white"
                  >
                    {personal.github.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "")}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}

        {/* PERSONAL INFORMATION SECTION */}
        {hasPersonalInfo && (
          <section data-page-break="item">
            <SidebarHeading>
              {isKhmer ? "ព័ត៌មានផ្ទាល់ខ្លួន" : "PERSONAL INFORMATION"}
            </SidebarHeading>
            <ul className="flex flex-col gap-1.5 text-[11px] text-white/95">
              <li className="flex items-baseline gap-2">
                <span className="font-bold text-[#00A3E0] select-none">•</span>
                <span className="font-semibold">{isKhmer ? "ឈ្មោះពេញ" : "Full Name"} :</span>
                <span>{fullName}</span>
              </li>
              {hasText(personal.gender) && (
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{isKhmer ? "ភេទ" : "Gender"} :</span>
                  <span>{personal.gender.trim()}</span>
                </li>
              )}
              {hasText(personal.nationality) && (
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{isKhmer ? "សញ្ជាតិ" : "Nationality"} :</span>
                  <span>{personal.nationality.trim()}</span>
                </li>
              )}
              {hasText(personal.dateOfBirth) && (
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{isKhmer ? "ថ្ងៃខែឆ្នាំកំណើត" : "Date of Birth"} :</span>
                  <span>{personal.dateOfBirth.trim()}</span>
                </li>
              )}
              {(hasText(personal.placeOfBirth) || hasText(personal.location)) && (
                <li className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{isKhmer ? "ទីកន្លែងកំណើត" : "Place of Birth"} :</span>
                  <span className="leading-snug">
                    {(personal.placeOfBirth || personal.location).trim()}
                  </span>
                </li>
              )}
            </ul>
          </section>
        )}

        {/* LANGUAGES SECTION */}
        {languages.length > 0 && (
          <section data-page-break="item">
            <SidebarHeading>{isKhmer ? "ភាសា" : "LANGUAGES"}</SidebarHeading>
            <ul className="flex flex-col gap-1.5 text-[11px] text-white/95">
              {languages.map((lang) => (
                <li key={lang.id} className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="font-semibold">{lang.name.trim()}</span>
                  {hasText(lang.proficiency) && (
                    <span>: {lang.proficiency.trim()}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* STRENGTHS SECTION */}
        {strengthsList.length > 0 && (
          <section data-page-break="item">
            <SidebarHeading>{isKhmer ? "ចំណុចខ្លាំង" : "STRENGTHS"}</SidebarHeading>
            <ul className="flex flex-col gap-1.5 text-[11px] text-white/95">
              {strengthsList.map((item, idx) => (
                <li key={idx} className="flex items-baseline gap-2">
                  <span className="font-bold text-[#00A3E0] select-none">•</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ============================================================== */}
      {/* RIGHT MAIN COLUMN: Warm Crisp Off-White (#FAF9F6)             */}
      {/* ============================================================== */}
      <main className="flex-1 bg-[#FAF9F6] p-8 flex flex-col gap-5.5">
        {/* Name Header */}
        <header data-page-break="item" className="pb-1">
          <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-[#1E2532] leading-none">
            {fullName}
          </h1>
          {hasText(personal.roleApplied) && (
            <p className="mt-2 text-[14px] font-medium text-neutral-800">
              {isKhmer ? "ដាក់ពាក្យសម្រាប់: " : "Apply for: "}
              <span className="font-bold text-[#1E2532]">
                {personal.roleApplied.trim()}
              </span>
            </p>
          )}
        </header>

        {/* ABOUT ME SECTION */}
        {hasText(document.summary) && (
          <section data-page-break="item">
            <PillBanner>{isKhmer ? "អំពីខ្ញុំ" : "ABOUT ME"}</PillBanner>
            <p className="text-[11.5px] leading-relaxed text-neutral-800">
              {document.summary.trim()}
            </p>
          </section>
        )}

        {/* EDUCATION SECTION */}
        {education.length > 0 && (
          <section data-page-break="item">
            <PillBanner>{isKhmer ? "ការអប់រំ" : "EDUCATION"}</PillBanner>
            <div className="flex flex-col gap-2 text-[11.5px] text-neutral-800">
              {education.map((entry) => {
                const dates = dateRange(
                  entry.startDate,
                  entry.endDate,
                  false,
                  isKhmer ? "km" : "en"
                );
                return (
                  <div key={entry.id} data-page-break="item" className="flex items-start gap-2">
                    <span className="font-bold text-[#1E2532] select-none leading-none mt-1">
                      •
                    </span>
                    <div className="leading-snug">
                      {dates && (
                        <span className="font-bold text-[#1E2532]">{dates}: </span>
                      )}
                      <span>
                        {[entry.degree, entry.field].filter(Boolean).join(" in ")}
                        {entry.school && ` at ${entry.school.trim()}`}
                      </span>
                      {hasText(entry.details) && (
                        <p className="text-neutral-600 mt-0.5">{entry.details.trim()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TECHNICAL SKILLS SECTION (2 Columns) */}
        {skills.length > 0 && (
          <section data-page-break="item">
            <PillBanner>{isKhmer ? "ជំនាញបច្ចេកទេស" : "TECHNICAL SKILLS"}</PillBanner>
            <div className="grid grid-cols-2 gap-4 text-[11.5px] text-neutral-800">
              {/* Column 1 */}
              <ul className="flex flex-col gap-1">
                {skillsCol1.map((skill) => (
                  <li key={skill.id} className="flex items-center gap-2">
                    <span className="font-bold text-[#1E2532] select-none">•</span>
                    <span>{skill.name.trim()}</span>
                  </li>
                ))}
              </ul>

              {/* Column 2 */}
              {skillsCol2.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {skillsCol2.map((skill) => (
                    <li key={skill.id} className="flex items-center gap-2">
                      <span className="font-bold text-[#1E2532] select-none">•</span>
                      <span>{skill.name.trim()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* ACADEMIC PROJECT SECTION */}
        {projects.length > 0 && (
          <section data-page-break="item">
            <PillBanner>
              {isKhmer ? "គម្រោងសិក្សា" : "ACADEMIC PROJECT"}
            </PillBanner>
            <div className="flex flex-col gap-3.5 text-[11.5px] text-neutral-800">
              {projects.map((proj) => (
                <div key={proj.id} data-page-break="item" className="flex flex-col gap-1">
                  <h4 className="font-bold text-[#1E2532] text-[12px]">
                    {proj.name.trim()}
                  </h4>
                  {hasText(proj.description) && (
                    <p className="text-neutral-700 leading-snug">
                      {proj.description.trim()}
                    </p>
                  )}
                  {proj.bullets.length > 0 && (
                    <ul className="flex flex-col gap-1 mt-0.5">
                      {proj.bullets
                        .filter((b) => hasText(b.text))
                        .map((b) => (
                          <li key={b.id} className="flex items-start gap-2">
                            <span className="font-bold text-[#1E2532] select-none leading-none mt-1">
                              •
                            </span>
                            <span className="leading-snug">{b.text.trim()}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* WORK EXPERIENCE SECTION (if experience entries exist) */}
        {experience.length > 0 && (
          <section data-page-break="item">
            <PillBanner>
              {isKhmer ? "បទពិសោធន៍ការងារ" : "WORK EXPERIENCE"}
            </PillBanner>
            <div className="flex flex-col gap-3.5 text-[11.5px] text-neutral-800">
              {experience.map((entry) => {
                const dates = dateRange(
                  entry.startDate,
                  entry.endDate,
                  entry.current,
                  isKhmer ? "km" : "en"
                );
                return (
                  <div key={entry.id} data-page-break="item" className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-bold text-[#1E2532] text-[12px]">
                        {[entry.role, entry.company].filter(Boolean).join(" — ")}
                      </h4>
                      {dates && (
                        <span className="text-[10.5px] font-medium text-neutral-600 shrink-0">
                          {dates}
                        </span>
                      )}
                    </div>
                    {entry.bullets.length > 0 && (
                      <ul className="flex flex-col gap-1 mt-0.5">
                        {entry.bullets
                          .filter((b) => hasText(b.text))
                          .map((b) => (
                            <li key={b.id} className="flex items-start gap-2">
                              <span className="font-bold text-[#1E2532] select-none leading-none mt-1">
                                •
                              </span>
                              <span className="leading-snug">{b.text.trim()}</span>
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

        {/* CERTIFICATIONS SECTION */}
        {certifications.length > 0 && (
          <section data-page-break="item">
            <PillBanner>{isKhmer ? "វិញ្ញាបនបត្រ" : "CERTIFICATIONS"}</PillBanner>
            <div className="flex flex-col gap-2 text-[11.5px] text-neutral-800">
              {certifications.map((cert) => (
                <div key={cert.id} data-page-break="item" className="flex items-start gap-2">
                  <span className="font-bold text-[#1E2532] select-none mt-1 leading-none">
                    •
                  </span>
                  <div>
                    <span className="font-bold text-[#1E2532]">{cert.name.trim()}</span>
                    {hasText(cert.issuer) && ` — ${cert.issuer.trim()}`}
                    {hasText(cert.issueDate) && ` (${cert.issueDate.trim()})`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REFERENCES SECTION */}
        {references.length > 0 && (
          <section data-page-break="item">
            <PillBanner>{isKhmer ? "បុគ្គលយោង" : "REFERENCES"}</PillBanner>
            <div className="flex flex-col gap-3 text-[11.5px] text-neutral-800">
              {references.map((ref) => (
                <div key={ref.id} data-page-break="item" className="flex flex-col gap-0.5">
                  <p className="font-bold text-[#1E2532] text-[12px]">
                    {ref.name.trim()}
                  </p>
                  {hasText(ref.position) && (
                    <p>
                      <span className="font-semibold text-neutral-900">
                        {isKhmer ? "តួនាទី" : "Position"} :{" "}
                      </span>
                      {ref.position.trim()}
                    </p>
                  )}
                  {hasText(ref.workplace) && (
                    <p>
                      <span className="font-semibold text-neutral-900">
                        {isKhmer ? "កន្លែងធ្វើការ" : "Workplace"} :{" "}
                      </span>
                      {ref.workplace.trim()}
                    </p>
                  )}
                  {hasText(ref.email) && (
                    <p>
                      <span className="font-semibold text-neutral-900">Email : </span>
                      <a
                        href={`mailto:${ref.email.trim()}`}
                        className="hover:underline text-neutral-800"
                      >
                        {ref.email.trim()}
                      </a>
                    </p>
                  )}
                  {hasText(ref.phone) && (
                    <p>
                      <span className="font-semibold text-neutral-900">Phone : </span>
                      {ref.phone.trim()}
                    </p>
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
