"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Copy,
  Download,
  MoreHorizontal,
  PenLine,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { TEMPLATE_NAME, formatRelativeTime, type DashboardResume } from "@/lib/resume-meta";
import { useLanguage } from "@/lib/i18n/context";
import { SectionDashes } from "./section-dashes";
import { ResumeCardPreview } from "./resume-card-preview";
import { Spinner } from "@/components/ui/spinner";

type ResumeCardProps = {
  resume: DashboardResume;
  busy?: boolean;
  onOpen: (resume: DashboardResume) => void;
  onRename: (resume: DashboardResume) => void;
  onDuplicate: (resume: DashboardResume) => void;
  onDelete: (resume: DashboardResume) => void;
};

export function ResumeCard({
  resume,
  busy = false,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ResumeCardProps) {
  const { t, locale, isKhmer } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  async function handleDownloadPdf() {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/resumes/${resume.id}/pdf`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || "Failed to generate resume PDF.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = `${resume.title || "Resume"}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success(isKhmer ? "បានទាញយក PDF រួចរាល់។" : "PDF downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : (isKhmer ? "មិនអាចទាញយក PDF បានទេ។" : "Couldn't download resume PDF.")
      );
    } finally {
      setIsDownloading(false);
    }
  }

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function menuItem(label: string, Icon: LucideIcon, action: () => void, danger = false) {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setMenuOpen(false);
          action();
        }}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150 cursor-pointer ${
          danger
            ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
            : "text-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Icon size={15} strokeWidth={1.9} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <article className="group relative flex flex-col rounded-2xl border border-hairline bg-card transition hover:border-primary/40 hover:shadow-[0_20px_40px_-20px_rgba(0,70,67,0.18)]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(resume)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(resume);
          }
        }}
        aria-label={`Open “${resume.title}” in the editor`}
        className="relative block cursor-pointer overflow-hidden rounded-t-2xl border-b border-hairline bg-background p-4 pb-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="block h-[150px] overflow-hidden rounded-t-xl bg-card ring-1 ring-border/30 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1">
          <ResumeCardPreview resume={resume} />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-t-2xl bg-primary/15 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-md border border-hairline">
            {t.card.openEditor}
            <ArrowUpRight size={12} />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <SectionDashes filled={resume.filledSections} />

        <div className="mt-3 flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-display text-[15px] font-bold leading-snug truncate">
            {resume.title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1">
            <button
              type="button"
              aria-label={`Download PDF for “${resume.title}”`}
              disabled={isDownloading || busy}
              onClick={(e) => {
                e.stopPropagation();
                void handleDownloadPdf();
              }}
              title={t.card.downloadPdf}
              className="grid size-7.5 place-items-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? <Spinner /> : <Download size={14} aria-hidden />}
            </button>
            <div ref={menuRef} className="relative">
              <button
                ref={menuButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Actions for “${resume.title}”`}
                disabled={busy}
                onClick={() => setMenuOpen((open) => !open)}
                className="grid size-7.5 place-items-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {busy ? (
                  <Spinner />
                ) : (
                  <MoreHorizontal size={15} aria-hidden />
                )}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  aria-label={`Actions for “${resume.title}”`}
                  className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-hairline bg-card p-1 shadow-lg"
                >
                  {menuItem(t.card.openEditor, ArrowUpRight, () => onOpen(resume))}
                  {menuItem(
                    isDownloading ? t.card.downloading : t.card.downloadPdf,
                    Download,
                    () => void handleDownloadPdf()
                  )}
                  {menuItem(t.card.rename, PenLine, () => onRename(resume))}
                  {menuItem(t.card.duplicate, Copy, () => onDuplicate(resume))}
                  <div className="my-1 h-px bg-hairline" />
                  {menuItem(t.card.delete, Trash2, () => onDelete(resume), true)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono rounded-md bg-stone-50 dark:bg-muted/40 border border-hairline px-2 py-0.5 text-[11px] font-medium text-foreground/80">
            {TEMPLATE_NAME[resume.templateId]}
          </span>
          <span suppressHydrationWarning className="font-mono text-[11px] text-muted-foreground">
            {formatRelativeTime(resume.updatedAt, undefined, locale)}
          </span>
        </div>
      </div>
    </article>
  );
}
