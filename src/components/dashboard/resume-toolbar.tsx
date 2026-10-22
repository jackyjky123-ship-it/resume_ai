"use client";

import { ChevronDown, Search } from "lucide-react";
import { TEMPLATES, type TemplateId } from "@/lib/resume-meta";

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
  const filters: { id: TemplateFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalCount },
    ...TEMPLATES.map((template) => ({
      id: template.id,
      label: template.name,
      count: counts[template.id],
    })),
  ];

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-hairline pt-6">
      <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
        <span className="sr-only">Search resumes</span>
        <Search
          size={16}
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search resumes"
          className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-graphite focus:border-[#004643] focus:outline-none"
        />
      </label>

      <div role="group" aria-label="Filter by template" className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => {
          const active = templateFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={active}
              onClick={() => onTemplateFilterChange(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? "border-[#004643] bg-[#004643] text-[#f0ede5] shadow-xs"
                  : "border-hairline bg-white text-foreground/80 hover:border-[#004643]/40"
              }`}
            >
              {filter.label}
              <span className={`tabular-nums ${active ? "text-[#f0ede5]/70" : "text-graphite"}`}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      <label className="relative ml-auto flex items-center">
        <span className="sr-only">Sort resumes</span>
        <select
          value={sortKey}
          onChange={(event) => onSortKeyChange(event.target.value as SortKey)}
          className="appearance-none rounded-full border border-hairline bg-white py-2.5 pl-4 pr-9 text-sm font-medium"
        >
          <option value="edited">Last edited</option>
          <option value="created">Newest</option>
          <option value="name">Name A–Z</option>
        </select>
        <ChevronDown
          size={14}
          aria-hidden
          className="pointer-events-none absolute right-3.5 text-graphite"
        />
      </label>
    </div>
  );
}
