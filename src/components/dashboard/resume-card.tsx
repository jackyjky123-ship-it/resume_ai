"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  PenLine,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { TEMPLATE_NAME, formatRelativeTime, type DashboardResume } from "@/lib/mock/dashboard";
import { SectionDashes } from "./section-dashes";
import { TemplateSheet } from "./template-sheet";

type ResumeCardProps = {
  resume: DashboardResume;
  onOpen: (resume: DashboardResume) => void;
  onRename: (resume: DashboardResume) => void;
  onDuplicate: (resume: DashboardResume) => void;
  onDelete: (resume: DashboardResume) => void;
};

export function ResumeCard({ resume, onOpen, onRename, onDuplicate, onDelete }: ResumeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-background ${
          danger ? "text-heart" : ""
        }`}
      >
        <Icon size={15} strokeWidth={1.9} aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <article className="group relative flex flex-col rounded-2xl border border-hairline bg-white transition hover:border-foreground/25 hover:shadow-[0_26px_50px_-32px_rgba(38,38,38,0.4)]">
      <button
        type="button"
        onClick={() => onOpen(resume)}
        aria-label={`Open “${resume.title}” in the editor`}
        className="relative block overflow-hidden rounded-t-2xl border-b border-hairline bg-background p-4 pb-0 text-left"
      >
        <span className="block h-[150px] overflow-hidden rounded-t-xl bg-white ring-1 ring-black/5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1">
          <TemplateSheet templateId={resume.templateId} />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-t-2xl bg-white/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
            Open editor
            <ArrowUpRight size={12} />
          </span>
        </span>
      </button>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <SectionDashes filled={resume.filledSections} />

        <div className="mt-3 flex items-start gap-2">
          <h3 className="min-w-0 flex-1 font-display text-[15px] font-bold leading-snug">
            {resume.title}
          </h3>
          <div ref={menuRef} className="relative -mr-1.5 -mt-1.5">
            <button
              ref={menuButtonRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={`Actions for “${resume.title}”`}
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-8 place-items-center rounded-full text-graphite hover:bg-background hover:text-foreground"
            >
              <MoreHorizontal size={16} aria-hidden />
            </button>
            {menuOpen && (
              <div
                role="menu"
                aria-label={`Actions for “${resume.title}”`}
                className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-hairline bg-white p-1 shadow-[0_22px_45px_-24px_rgba(38,38,38,0.5)]"
              >
                {menuItem("Open editor", ArrowUpRight, () => onOpen(resume))}
                {menuItem("Rename", PenLine, () => onRename(resume))}
                {menuItem("Duplicate", Copy, () => onDuplicate(resume))}
                <div className="my-1 h-px bg-hairline" />
                {menuItem("Delete", Trash2, () => onDelete(resume), true)}
              </div>
            )}
          </div>
        </div>

        <p className="mt-1 text-xs text-graphite">
          {TEMPLATE_NAME[resume.templateId]} template · edited{" "}
          <span suppressHydrationWarning>{formatRelativeTime(resume.updatedAt)}</span>
        </p>
      </div>
    </article>
  );
}
