import "server-only";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ResumeDocument } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";
import { ResumePdfDocument } from "../pdf/pdf-document";
import { sanitizeResumePhotoForPdf } from "../pdf/photo";

/**
 * Generates an ASCII/URL-safe download filename for a resume PDF.
 * Format: "Jane_Doe_Resume.pdf" or "FullStack_Developer_Resume.pdf".
 */
export function formatResumePdfFilename(fullName: string, fallbackTitle: string): string {
  const base = fullName.trim() || fallbackTitle.trim() || "Resume";
  const sanitized = base
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  return `${sanitized || "Resume"}.pdf`;
}

/**
 * Compiles a ResumeDocument and TemplateId into a valid A4 PDF Buffer.
 */
export async function renderResumePdf(
  document: ResumeDocument,
  templateId: TemplateId
): Promise<Buffer> {
  const safeDocument = await sanitizeResumePhotoForPdf(document);
  const element = React.createElement(ResumePdfDocument, {
    document: safeDocument,
    templateId,
  });

  const buffer = await renderToBuffer(
    element as unknown as React.ReactElement<DocumentProps>
  );
  return Buffer.from(buffer);
}
