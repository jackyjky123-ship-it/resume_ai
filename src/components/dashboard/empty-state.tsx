"use client";

import { FilePlus, SearchX } from "lucide-react";

type EmptyStateProps = {
  /** True when resumes exist but the search/filter hides them all. */
  filtered: boolean;
  query: string;
  onClear: () => void;
  onCreate: () => void;
};

export function EmptyState({ filtered, query, onClear, onCreate }: EmptyStateProps) {
  const trimmedQuery = query.trim();

  if (filtered) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-hairline bg-white/60 px-8 py-16 text-center">
        <span className="ig-ring grid size-14 place-items-center rounded-full p-[2.5px]">
          <span className="grid size-full place-items-center rounded-full bg-white text-graphite">
            <SearchX size={20} strokeWidth={1.8} aria-hidden />
          </span>
        </span>
        <h3 className="mt-5 font-display text-xl font-bold">
          {trimmedQuery ? (
            <>No resumes match “{trimmedQuery}”.</>
          ) : (
            <>No resumes use this template yet.</>
          )}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite">
          Try a shorter search, or clear the filters to see every resume again.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold hover:border-foreground/40"
        >
          Clear search &amp; filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-hairline bg-white/60 px-8 py-16 text-center">
      <span className="ig-ring grid size-14 place-items-center rounded-full p-[2.5px]">
        <span className="grid size-full place-items-center rounded-full bg-white">
          <FilePlus size={20} strokeWidth={1.8} aria-hidden />
        </span>
      </span>
      <h3 className="mt-5 font-display text-xl font-bold">Your first resume starts here.</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite">
        Give it a title, pick one of three templates, and fill in the five sections. The preview
        updates as you go.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-action px-6 py-3 text-[15px] font-semibold text-white hover:bg-action-strong"
      >
        <FilePlus size={16} aria-hidden />
        Create your first resume
      </button>
    </div>
  );
}
