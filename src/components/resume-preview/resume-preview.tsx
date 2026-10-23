import React from "react";
import type { ResumeDocument } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";
import { ResumeBody } from "./resume-body";
import { PagedResumePreview } from "./paged-resume-preview";

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
  // If thumbnail mode (dashboard cards), render simple scaled single-sheet
  if (isThumbnail) {
    return (
      <article
        aria-label="Resume thumbnail"
        className={
          className ??
          "mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col bg-white px-8 py-8 text-[13px] leading-[1.55]"
        }
      >
        <ResumeBody document={document} templateId={templateId} />
      </article>
    );
  }

  // Interactive Live Preview: multi-page A4 Canva canvas sheets
  return (
    <PagedResumePreview
      document={document}
      templateId={templateId}
      className={className}
    />
  );
}

export { ResumeBody };
