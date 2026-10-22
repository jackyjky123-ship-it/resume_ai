import React from "react";
import { Document } from "@react-pdf/renderer";
import type { ResumePdfProps } from "./types";
import { ClassicPdf } from "./components/classic-pdf";
import { ModernPdf } from "./components/modern-pdf";
import { CompactPdf } from "./components/compact-pdf";
import { ProfessionalPdf } from "./components/professional-pdf";
import { EditorialPdf } from "./components/editorial-pdf";
import { DesignerPdf } from "./components/designer-pdf";

export function ResumePdfDocument({ document, templateId }: ResumePdfProps) {
  const authorName = document.personal.fullName.trim() || "Niseth Code";
  const docTitle = `${authorName} - Resume`;

  return (
    <Document
      title={docTitle}
      author={authorName}
      subject="Curriculum Vitae"
      creator="Niseth Code (nisethcode.com)"
      producer="Niseth Code PDF Engine"
    >
      {templateId === "modern" && <ModernPdf document={document} />}
      {templateId === "compact" && <CompactPdf document={document} />}
      {templateId === "professional" && <ProfessionalPdf document={document} />}
      {templateId === "editorial" && <EditorialPdf document={document} />}
      {templateId === "designer" && <DesignerPdf document={document} />}
      {templateId !== "modern" &&
        templateId !== "compact" &&
        templateId !== "professional" &&
        templateId !== "editorial" &&
        templateId !== "designer" && <ClassicPdf document={document} />}
    </Document>
  );
}

