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


/** Vector avatar silhouette matching the reference portrait illustration */
function AvatarSilhouette() {
  return (
    <svg
      viewBox="0 0 160 213"
      className="size-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="160" height="213" fill="#d1d5db" />
      {/* Head and neck base */}
      <path
        d="M80 48C69 48 61 57 61 69C61 81 69 90 80 90C91 90 99 81 99 69C99 57 91 48 80 48Z"
        fill="#f8fafc"
      />
      {/* Neck */}
      <path d="M74 88H86V108H74V88Z" fill="#f8fafc" />
      {/* Hair graphic with subtle side part and texture */}
      <path
        d="M80 41C65 41 56 52 56 66C56 70 57 74 59 78C61 74 63 68 66 65C70 61 77 60 83 62C89 64 94 60 97 57C99 60 100 64 100 68C102 64 103 60 103 56C103 47 93 41 80 41Z"
        fill="#475569"
      />
      {/* Shoulders / bust */}
      <path
        d="M28 213C28 142 48 114 80 114C112 114 132 142 132 213H28Z"
        fill="#64748b"
      />
    </svg>
  );
}

export function EditorialPreview({ document }: { document: ResumeDocument }) {
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

  const hasAnyContact =
    hasText(document.personal.location) ||
    hasText(document.personal.phone) ||
    hasText(document.personal.email) ||
    hasText(document.personal.linkedin) ||
    hasText(document.personal.website) ||
    hasText(document.personal.github);

  return (
    <div className="flex gap-8 text-slate-800">
      {/* Left Sidebar (35% width) */}
      <aside className="flex w-[35%] shrink-0 flex-col gap-5">

        {/* Profile Photo / Avatar Frame */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-slate-300 bg-slate-100 shadow-2xs">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={document.personal.photoUrl}
              alt={document.personal.fullName || "Profile"}
              className="size-full object-contain"
            />
          ) : (
            <AvatarSilhouette />
          )}
        </div>

        {/* Contact Section */}
        <section>
          <SidebarHeading>Contact</SidebarHeading>
          {hasAnyContact ? (
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
          ) : (
            <div className="flex flex-col gap-2.5 text-[11.5px] text-slate-600">
              <div>
                <span className="block font-bold text-slate-950">Address:</span>
                <span className="text-slate-500 leading-snug">
                  177 Great Portland Street, London WSW 6PQ
                </span>
              </div>
              <div>
                <span className="block font-bold text-slate-950">Phone:</span>
                <span className="text-slate-500 leading-snug">+44 (0)20 7666 8555</span>
              </div>
              <div>
                <span className="block font-bold text-slate-950">Email:</span>
                <span className="text-slate-500 leading-snug">christoper.m@gmail.com</span>
              </div>
              <div>
                <span className="block font-bold text-slate-950">LinkedIn:</span>
                <span className="text-slate-500 leading-snug">linkedin.com/christopher.morgan</span>
              </div>
            </div>
          )}
        </section>

        {/* Languages Section */}
        <section>
          <SidebarHeading>Languages</SidebarHeading>
          {languages.length > 0 ? (
            <div className="flex flex-col gap-1 text-[11.5px] font-medium text-slate-800">
              {languages.map((l) => (
                <div key={l.id}>
                  {l.name.trim()}
                  {hasText(l.proficiency) ? ` – ${l.proficiency.trim()}` : ""}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1 text-[11.5px] font-medium text-slate-600">
              <div>Spanish – C2</div>
              <div>Chinese – A1</div>
              <div>German – A2</div>
            </div>
          )}
        </section>

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
        {/* Name & Target Role Header */}
        <div>
          <h1 className="font-display text-[28px] font-black leading-tight tracking-tight text-slate-950 sm:text-[34px]">
            {document.personal.fullName.trim() || "Your Name"}
          </h1>
          {hasText(document.personal.roleApplied) ? (
            <p className="mt-1 text-[12px] font-bold uppercase tracking-wider text-slate-600">
              {document.personal.roleApplied.trim()}
            </p>
          ) : (
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-slate-400">
              Web Developer
            </p>
          )}
        </div>

        {/* Summary Section */}
        <section>
          <MainHeading>Summary</MainHeading>
          {hasText(document.summary) ? (
            <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-slate-700">
              {document.summary.trim()}
            </p>
          ) : (
            <p className="whitespace-pre-line text-[11.5px] leading-relaxed text-slate-600">
              Senior Web Developer specializing in front and back-end development.
              Experienced with all stages of the development cycle for dynamic web projects.
              Well-versed in numerous programming languages including HTML5, PHP OOP, JavaScript, CSS, and MySQL.
              Strong background in project management and customer relations.
            </p>
          )}
        </section>

        {/* Skill Highlights Section (Dashed border box with 2-column bullets) */}
        <section>
          <h3 className="mb-2 font-display text-[15px] font-bold tracking-tight text-slate-950">
            Skill Highlights
          </h3>
          <div className="rounded-md border border-dashed border-slate-400/80 bg-slate-50/50 p-3.5">
            {skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-slate-800">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-start gap-2">
                    <span className="font-bold text-slate-950 select-none">•</span>
                    <span className="font-medium">{skill.name.trim()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Project management</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Creative design</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Strong decision maker</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Innovative</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Complex problem solver</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-950 select-none">•</span>
                  <span className="font-medium">Service-focused</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Experience Section */}
        <section>
          <MainHeading>Experience</MainHeading>
          {experience.length > 0 ? (
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
          ) : (
            <div className="flex flex-col">
              <div className="text-[12.5px] font-bold text-slate-950">
                <span>Web Developer</span>
                <span className="font-normal text-slate-700"> - 09/2020 to 05/2026</span>
              </div>
              <div className="mt-0.5 text-[11.5px] font-semibold text-slate-800">
                Luna Web Design, New York
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-slate-700 marker:text-slate-900">
                <li>Cooperate with designers to create clean interfaces and intuitive interactions.</li>
                <li>Develop project concepts and maintain optimal workflow.</li>
                <li>Work with senior developers to manage large, complex design projects for corporate clients.</li>
                <li>Complete detailed programming and development tasks for front and back-end web applications.</li>
                <li>Carry out quality assurance tests to discover errors and optimize usability.</li>
              </ul>
            </div>
          )}
        </section>

        {/* Education Section */}
        <section>
          <MainHeading>Education</MainHeading>
          {education.length > 0 ? (
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
          ) : (
            <div className="flex flex-col text-[12px]">
              <div className="text-slate-950">
                <span className="font-medium">Bachelor of Science: </span>
                <span className="font-bold">Computer Information Systems</span>
                <span className="font-normal text-slate-600"> - 2014</span>
              </div>
              <div className="mt-0.5 text-[11.5px] font-semibold text-slate-800">
                Columbia University, NY
              </div>
            </div>
          )}
        </section>

        {/* Certifications Section */}
        <section>
          <MainHeading>Certifications</MainHeading>
          {certifications.length > 0 ? (
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
          ) : (
            <div className="flex flex-col gap-1.5 text-[11.5px] leading-snug text-slate-800">
              <div>
                <span>PHP Framework (certificate): </span>
                <span className="font-bold text-slate-950">Zend, CodeIgniter</span>
              </div>
              <div>
                <span>Programming Languages: </span>
                <span className="font-bold text-slate-950">JavaScript, SQL, MySQL</span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
