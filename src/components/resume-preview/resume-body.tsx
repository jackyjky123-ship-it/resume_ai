import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";
import { useLanguage } from "@/lib/i18n/context";
import { contactLine, hasText } from "./preview-utils";
import { ClassicPreview } from "./classic-preview";
import { ModernPreview } from "./modern-preview";
import { CompactPreview } from "./compact-preview";
import { ProfessionalPreview } from "./professional-preview";
import { EditorialPreview } from "./editorial-preview";
import { DesignerPreview } from "./designer-preview";

export function ResumeBody({
  document,
  templateId = "classic",
}: {
  document: ResumeDocument;
  templateId?: TemplateId;
}) {
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

  if (templateId === "editorial") {
    return <EditorialPreview document={document} />;
  }

  if (templateId === "designer") {
    return <DesignerPreview document={document} />;
  }

  if (isBlank) {
    return (
      <div className="m-auto max-w-xs text-center text-sm text-neutral-400">
        <p className="font-semibold text-neutral-500">
          {isKhmer
            ? "ផ្ទាំងបង្ហាញប្រវត្តិរូបរបស់អ្នកចាប់ផ្តើមនៅទីនេះ។"
            : "Your preview starts here."}
        </p>
        <p className="mt-1.5">
          {isKhmer
            ? "បំពេញព័ត៌មានក្នុងប្រអប់ណាមួយ វានឹងបង្ហាញលើទំព័រនេះភ្លាមៗ។"
            : "Fill in any field and it appears on this page immediately."}
        </p>
      </div>
    );
  }

  return (
    <>
      {templateId === "modern" && <ModernPreview document={document} />}
      {templateId === "compact" && <CompactPreview document={document} />}
      {templateId === "professional" && (
        <ProfessionalPreview document={document} />
      )}
      {templateId !== "modern" &&
        templateId !== "compact" &&
        templateId !== "professional" && (
          <ClassicPreview document={document} />
        )}
    </>
  );
}
