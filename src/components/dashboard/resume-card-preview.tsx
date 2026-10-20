"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardResume } from "@/lib/resume-meta";
import { ResumePreview } from "@/components/resume-preview/resume-preview";
import { TemplateSheet } from "./template-sheet";
import { hasText } from "@/components/resume-preview/preview-utils";

export function ResumeCardPreview({ resume }: { resume: DashboardResume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.33);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / 794);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const doc = resume.content;
  const hasContent =
    doc &&
    (resume.filledSections.length > 0 ||
      hasText(doc.personal.fullName) ||
      hasText(doc.personal.roleApplied) ||
      hasText(doc.personal.photoUrl) ||
      hasText(doc.summary) ||
      doc.experience.length > 0 ||
      doc.education.length > 0 ||
      doc.skills.length > 0);

  if (!hasContent || !doc) {
    return <TemplateSheet templateId={resume.templateId} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-white select-none pointer-events-none"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: 794,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <ResumePreview
          document={doc}
          templateId={resume.templateId}
          isThumbnail
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white via-white/40 to-transparent" />
    </div>
  );
}
