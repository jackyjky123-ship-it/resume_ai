import type { ResumeDocument } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";
import { contactLine, hasText } from "./preview-utils";
import { ClassicPreview } from "./classic-preview";
import { ModernPreview } from "./modern-preview";
import { CompactPreview } from "./compact-preview";
import { ProfessionalPreview } from "./professional-preview";
import { EditorialPreview } from "./editorial-preview";

export function ResumePreview({
  document,
  templateId = "classic",
  isThumbnail = false,
  className,
}: {
  document: ResumeDocument;
  templateId?: TemplateId;
  isThumbnail?: boolean;
  className?: string;
}) {
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

  const isBlank =
    !hasText(document.personal.fullName) &&
    !hasText(document.personal.roleApplied) &&
    !hasText(document.personal.photoUrl) &&
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
      className={
        className ??
        (isThumbnail
          ? "mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white px-8 py-8 text-[13px] leading-[1.55]"
          : "mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white px-10 py-12 text-[13px] leading-[1.55] shadow-[0_30px_70px_-40px_rgba(38,38,38,0.45)] ring-1 ring-black/5 sm:px-14")
      }
    >
      {templateId === "editorial" ? (
        <EditorialPreview document={document} />
      ) : isBlank ? (
        <div className="m-auto max-w-xs text-center text-sm text-neutral-400">
          <p className="font-semibold text-neutral-500">
            Your preview starts here.
          </p>
          <p className="mt-1.5">
            Fill in any field and it appears on this page immediately.
          </p>
        </div>
      ) : (
        <>
          {templateId === "modern" && <ModernPreview document={document} />}
          {templateId === "compact" && <CompactPreview document={document} />}
          {templateId === "professional" && <ProfessionalPreview document={document} />}
          {templateId !== "modern" &&
            templateId !== "compact" &&
            templateId !== "professional" &&
            templateId !== "editorial" && (
              <ClassicPreview document={document} />
            )}
        </>
      )}
    </article>
  );
}
