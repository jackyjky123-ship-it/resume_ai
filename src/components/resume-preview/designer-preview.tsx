import React from "react";
import { Phone, Mail, MapPin, Send, Globe } from "lucide-react";
import type { ResumeDocument } from "@/lib/validations/resume";
import { useLanguage } from "@/lib/i18n/context";
import { dateRange, formatTelegram, hasText, languageLabel } from "./preview-utils";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 data-page-break="heading" className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-900">
      {children}
    </h3>
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

export function DesignerPreview({ document }: { document: ResumeDocument }) {
  const { isKhmer } = useLanguage();
  const { personal } = document;
  const fullName = personal.fullName.trim() || (isKhmer ? "ឈ្មោះរបស់អ្នក" : "Your Name");
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

  const hasAnyContact =
    hasText(personal.phone) ||
    hasText(personal.email) ||
    hasText(personal.location) ||
    hasText(personal.telegram) ||
    hasText(personal.website) ||
    hasText(personal.linkedin) ||
    hasText(personal.github);

  const confirmationText = hasText(document.summary)
    ? document.summary.trim()
    : hasText(personal.fullName)
    ? isKhmer
      ? `ខ្ញុំបាទ/នាងខ្ញុំ ${personal.fullName.trim()} សូមបញ្ជាក់ថាព័ត៌មានទាំងអស់ដែលមានក្នុងប្រវត្តិរូបសង្ខេបនេះ គឺពិតជាត្រឹមត្រូវពិតប្រាកដមែន។ ប្រសិនបើមានព័ត៌មានមិនពិតណាមួយ ខ្ញុំសូមទទួលខុសត្រូវទាំងស្រុងចំពោះមុខច្បាប់។`
      : `I am ${personal.fullName.trim()}. I would like to declare that all the information given in this Curriculum Vitae is completely correct. If there is any false information, I will take full responsibility for everything on my CV.`
    : "";

  return (
    <div className="flex min-h-[1027px] flex-col font-sans text-neutral-800">
      {/* Top Header */}
      <header data-page-break="item" className="mb-5 flex items-center border-b border-neutral-300 pb-5">
        {/* Profile Photo */}
        <div className="mr-5 h-[130px] w-[100px] shrink-0 overflow-hidden rounded-xs bg-[#0f172a] shadow-xs">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personal.photoUrl}
              alt={fullName}
              className="size-full object-cover object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[#0f172a] text-white">
              <span className="text-2xl font-bold tracking-tight">{initials}</span>
            </div>
          )}
        </div>

        {/* Title and Subtitle */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[28px] font-bold tracking-tight text-neutral-900 leading-none">
            {fullName}
          </h1>
          {hasText(personal.roleApplied) && (
            <p className="mt-2 text-[14px] font-medium text-neutral-800">
              {isKhmer ? "ដាក់ពាក្យសម្រាប់: " : "Apply for: "}{personal.roleApplied.trim()}
            </p>
          )}
        </div>
      </header>

      {/* Main Body with Vertical Divider */}
      <div className="flex flex-1">
        {/* Left Column (36%) */}
        <aside className="w-[36%] shrink-0 border-r border-neutral-300 pr-5 flex flex-col gap-4">
          {/* Contact Section */}
          {hasAnyContact && (
            <section>
              <SectionHeading>{isKhmer ? "ទំ នា ក់ ទំ ន ង :" : "C O N T A C T :"}</SectionHeading>
              <div className="flex flex-col gap-1.5 text-[11px] text-neutral-800">
                {hasText(personal.phone) && (
                  <div data-page-break="item" className="flex items-center gap-2 min-w-0">
                    <Phone className="size-3 text-neutral-900 shrink-0" />
                    <span className="truncate">{personal.phone.trim()}</span>
                  </div>
                )}
                {hasText(personal.email) && (
                  <div data-page-break="item" className="flex items-center gap-2 min-w-0">
                    <Mail className="size-3 text-neutral-900 shrink-0" />
                    <a
                      href={`mailto:${personal.email.trim()}`}
                      className="hover:underline truncate text-neutral-800"
                    >
                      {personal.email.trim()}
                    </a>
                  </div>
                )}
                {hasText(personal.location) && (
                  <div data-page-break="item" className="flex items-center gap-2 min-w-0">
                    <MapPin className="size-3 text-neutral-900 shrink-0" />
                    <span className="truncate">{personal.location.trim()}</span>
                  </div>
                )}
                {hasText(personal.telegram) && (
                  <div data-page-break="item" className="flex items-center gap-2 min-w-0">
                    <Send className="size-3 text-neutral-900 shrink-0" />
                    <a
                      href={formatTelegram(personal.telegram).url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline truncate text-neutral-800"
                    >
                      {personal.telegram.trim().startsWith("@")
                        ? personal.telegram.trim()
                        : `@${formatTelegram(personal.telegram).label.replace("t.me/", "")}`}
                    </a>
                  </div>
                )}
                {hasText(personal.website) && (
                  <div data-page-break="item" className="flex items-center gap-2 min-w-0">
                    <Globe className="size-3 text-neutral-900 shrink-0" />
                    <a
                      href={
                        personal.website.startsWith("http")
                          ? personal.website
                          : `https://${personal.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline truncate text-neutral-800"
                    >
                      {personal.website.trim().replace(/^https?:\/\//i, "")}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "ជំ ញា ញ :" : "S K I L L S :"}</SectionHeading>
              <ul className="flex flex-col gap-1 text-[11px] text-neutral-800">
                {skills.map((s) => (
                  <li key={s.id} data-page-break="item" className="flex items-start gap-1.5">
                    <span className="font-bold text-neutral-900 leading-none select-none">•</span>
                    <span className="leading-tight">{s.name.trim()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "កា រ អ ប់ រំ :" : "E D U C A T I O N :"}</SectionHeading>
              <div className="flex flex-col gap-2.5 text-[11px]">
                {education.map((entry) => {
                  const dates = dateRange(entry.startDate, entry.endDate, false, isKhmer ? "km" : "en");
                  const fieldFormatted = entry.field
                    ? entry.field.trim().startsWith("(") && entry.field.trim().endsWith(")")
                      ? entry.field.trim()
                      : `(${entry.field.trim()})`
                    : "";
                  const metaLine = [dates, fieldFormatted]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <div key={entry.id} data-page-break="item" className="leading-snug">
                      <p className="font-bold uppercase text-neutral-900">
                        {entry.school.trim() || (isKhmer ? "សាលា / សាកលវិទ្យាល័យ" : "School / University")}
                      </p>
                      {metaLine ? (
                        <p className="font-semibold text-neutral-700 text-[10.5px]">
                          {metaLine}
                        </p>
                      ) : null}
                      {hasText(entry.degree) && (
                        <p className="text-neutral-600 text-[10.5px]">
                          {entry.degree.trim()}
                        </p>
                      )}
                      {hasText(entry.details) && (
                        <p className="text-neutral-500 text-[10px] mt-0.5">
                          {entry.details.trim()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Languages Section */}
          {languages.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "ភា សា :" : "L A N G U A G E :"}</SectionHeading>
              <ul className="flex flex-col gap-1 text-[11px] text-neutral-800">
                {languages.map((l) => (
                  <li key={l.id} data-page-break="item" className="flex items-start gap-1.5">
                    <span className="font-bold text-neutral-900 leading-none select-none">•</span>
                    <span className="leading-tight">
                      {languageLabel(l.name, l.proficiency)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Right Column (62%) */}
        <main className="w-[62%] pl-6 flex flex-col gap-4">
          {/* Experience Section */}
          {experience.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "ប ទ ពិ សោ ធ ន៍ :" : "E X P E R I E N C E :"}</SectionHeading>
              <div className="flex flex-col gap-3.5">
                {experience.map((entry) => {
                  const bullets = entry.bullets.filter((b) => hasText(b.text));
                  const dates = dateRange(
                    entry.startDate,
                    entry.endDate,
                    entry.current,
                    isKhmer ? "km" : "en"
                  );
                  const roleDateLine = [entry.role.trim() || (isKhmer ? "មុខតំណែង" : "Role"), dates]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <div key={entry.id} data-page-break="item" className="text-[11px] leading-snug">
                      <p className="font-bold uppercase text-neutral-900">
                        {roleDateLine}
                      </p>
                      {hasText(entry.company) && (
                        <p className="font-bold text-neutral-800 mb-1">
                          {[entry.company.trim(), entry.location.trim()]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      )}
                      {bullets.length > 0 && (
                        <ul className="flex flex-col gap-1 mt-1">
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

          {/* Tech Stack / Key Projects Section */}
          {projects.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "ប ច្ចេ ក វិ ទ្យា :" : "T E C H   S T A C K :"}</SectionHeading>
              <ul className="flex flex-col gap-1.5 text-[11px]">
                {projects.map((p) => {
                  const bullets = p.bullets.filter((b) => hasText(b.text));
                  const desc = p.description.trim();

                  return (
                    <li key={p.id} data-page-break="item" className="flex items-start gap-1.5">
                      <span className="font-bold text-neutral-900 select-none">•</span>
                      <span className="text-neutral-700 leading-tight">
                        {hasText(p.name) && (
                          <strong className="font-bold text-neutral-900 mr-1">
                            {p.name.trim()}:
                          </strong>
                        )}
                        {desc ? desc : ""}
                        {bullets.length > 0 ? ` ${bullets.map((b) => b.text.trim()).join("; ")}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* References Section */}
          {references.length > 0 && (
            <section>
              <SectionHeading>{isKhmer ? "អ្នកយោង" : "R E F E R E N C E S :"}</SectionHeading>
              <div className="flex flex-col gap-2 text-[11px] leading-snug">
                {references.map((entry) => (
                  <div key={entry.id} data-page-break="item">
                    <p className="font-bold text-neutral-900">
                      {[entry.name.trim(), entry.position.trim()]
                        .filter(Boolean)
                        .join(" — ")}
                    </p>
                    {[entry.workplace, entry.email, entry.phone]
                      .filter(hasText)
                      .length > 0 && (
                      <p className="text-neutral-600">
                        {[entry.workplace, entry.email, entry.phone]
                          .filter(hasText)
                          .map((value) => value.trim())
                          .join(" | ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Confirmation / Declaration Section */}
          {hasText(confirmationText) && (
            <section data-page-break="item">
              <SectionHeading>{isKhmer ? "កា រ ប ញ្ជា ក់ :" : "C O N F I R M A T I O N :"}</SectionHeading>
              <p className="text-[11px] leading-relaxed text-neutral-800">
                {confirmationText}
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
