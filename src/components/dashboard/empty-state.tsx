"use client";

import {
  Briefcase,
  Code2,
  Coffee,
  FilePlus,
  GraduationCap,
  Headphones,
  SearchX,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { StarterRole } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";

type EmptyStateProps = {
  /** True when resumes exist but the search/filter hides them all. */
  filtered: boolean;
  query: string;
  onClear: () => void;
  onCreate: () => void;
  onSelectStarter?: (role: StarterRole, templateId: TemplateId, title: string) => void;
  isCreating?: boolean;
};

const STARTER_CONFIG: {
  role: StarterRole;
  templateId: TemplateId;
  templateLabel: string;
  icon: typeof Coffee;
}[] = [
  {
    role: "barista",
    templateId: "classic",
    templateLabel: "Template 01",
    icon: Coffee,
  },
  {
    role: "retail",
    templateId: "classic",
    templateLabel: "Template 01",
    icon: ShoppingBag,
  },
  {
    role: "software",
    templateId: "editorial",
    templateLabel: "Template 05",
    icon: Code2,
  },
  {
    role: "support",
    templateId: "modern",
    templateLabel: "Template 02",
    icon: Headphones,
  },
  {
    role: "intern",
    templateId: "compact",
    templateLabel: "Template 03",
    icon: GraduationCap,
  },
];

export function EmptyState({
  filtered,
  query,
  onClear,
  onCreate,
  onSelectStarter,
  isCreating = false,
}: EmptyStateProps) {
  const { t } = useLanguage();
  const trimmedQuery = query.trim();

  if (filtered) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-hairline bg-white/60 dark:bg-card/40 px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-stone-100 dark:bg-muted text-muted-foreground border border-hairline">
          <SearchX size={20} strokeWidth={1.8} aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
          {trimmedQuery
            ? t.emptyState.noResumesMatch.replace("{query}", trimmedQuery)
            : t.emptyState.noResumesTemplate}
        </h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {t.emptyState.filterHelp}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-lg border border-hairline bg-white dark:bg-card px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
        >
          {t.emptyState.clearFilters}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-hairline bg-white/70 dark:bg-card/40 p-6 sm:p-10 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
        <Sparkles size={20} strokeWidth={2} aria-hidden />
      </span>

      <h3 className="mt-4 font-display text-xl font-bold text-foreground">
        {t.emptyState.firstResumeTitle}
      </h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
        {t.emptyState.firstResumeDesc}
      </p>

      {/* Starter Role Chips */}
      <div className="mt-6 w-full max-w-2xl text-left space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="size-3 text-primary" />
            {t.emptyState.quickStarters}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {t.emptyState.prewrittenBullets}
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {STARTER_CONFIG.map((cfg) => {
            const Icon = cfg.icon;
            const preset = t.emptyState.presets[cfg.role];
            return (
              <button
                key={cfg.role}
                type="button"
                disabled={isCreating}
                onClick={() =>
                  onSelectStarter
                    ? onSelectStarter(cfg.role, cfg.templateId, preset.title)
                    : onCreate()
                }
                className="group relative flex items-start gap-3 rounded-xl border border-hairline bg-white dark:bg-card p-3.5 text-left transition-all hover:border-primary hover:shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-stone-100 dark:bg-muted text-primary border border-hairline group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="size-4.5" />
                </span>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground truncate group-hover:text-primary">
                      {preset.title}
                    </span>
                    <span className="font-mono text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {cfg.templateLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">
                    {preset.description}
                  </p>
                  <p className="font-mono text-[10px] text-primary font-medium pt-0.5">
                    + {preset.highlight}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Or create blank document */}
      <div className="mt-6 pt-5 border-t border-hairline w-full max-w-2xl flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white dark:bg-card px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95 cursor-pointer shadow-2xs"
        >
          <FilePlus size={14} aria-hidden />
          <span>{t.emptyState.createBlank}</span>
        </button>
      </div>
    </div>
  );
}
