"use client";

import { ChevronDown, Search } from "lucide-react";
import { TEMPLATES, type TemplateId } from "@/lib/resume-meta";
import { useLanguage } from "@/lib/i18n/context";

export type TemplateFilter = TemplateId | "all";
export type SortKey = "edited" | "created" | "name";

type ResumeToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  templateFilter: TemplateFilter;
  onTemplateFilterChange: (value: TemplateFilter) => void;
  sortKey: SortKey;
  onSortKeyChange: (value: SortKey) => void;
  counts: Record<TemplateId, number>;
  totalCount: number;
};

export function ResumeToolbar({
  query,
  onQueryChange,
  templateFilter,
  onTemplateFilterChange,
  sortKey,
  onSortKeyChange,
  counts,
  totalCount,
}: ResumeToolbarProps) {
  const { t, isKhmer } = useLanguage();

  const filters: { id: TemplateFilter; label: string; count: number }[] = [
    { id: "all", label: t.dashboard.allTemplates, count: totalCount },
    ...TEMPLATES.map((template) => ({
      id: template.id,
      label: template.name,
      count: counts[template.id],
    })),
  ];

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
      <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <span className="sr-only">{t.common.search}</span>
        <Search
          size={14}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-graphite/70"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t.dashboard.searchPlaceholder}
          className="w-full rounded-xl border border-hairline bg-card py-2 pl-9 pr-8 text-xs sm:text-sm placeholder:text-muted-foreground shadow-2xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground border border-hairline bg-muted px-1.5 py-0.5 rounded">
          /
        </span>
      </label>

      <div role="group" aria-label={t.common.filter} className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => {
          const active = templateFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onTemplateFilterChange(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90"
                  : "border-hairline bg-card text-foreground/80 hover:border-primary/40 hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <span>{filter.label}</span>
              <span className={`text-[11px] tabular-nums ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      <label className="relative ml-auto flex items-center">
        <span className="sr-only">Sort</span>
        <select
          value={sortKey}
          onChange={(event) => onSortKeyChange(event.target.value as SortKey)}
          className="appearance-none rounded-lg border border-hairline bg-card py-1.5 pl-3 pr-8 text-xs font-medium shadow-2xs hover:border-primary/40 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
        >
          <option value="edited" className="bg-card text-foreground">{t.dashboard.sortLastModified}</option>
          <option value="created" className="bg-card text-foreground">{isKhmer ? "ថ្មីបំផុត" : "Newest"}</option>
          <option value="name" className="bg-card text-foreground">{t.dashboard.sortTitle}</option>
        </select>
        <ChevronDown
          size={13}
          aria-hidden
          className="pointer-events-none absolute right-2.5 text-graphite"
        />
      </label>
    </div>
  );
}
