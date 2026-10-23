import { RESUME_SECTIONS, type SectionKey } from "@/lib/resume-meta";

/**
 * The five editor sections as story-style dashes: filled when a section has
 * content, hollow when it's still empty. A completed resume earns the gradient dot.
 */
export function SectionDashes({ filled }: { filled: SectionKey[] }) {
  const count = filled.length;
  const total = RESUME_SECTIONS.length;
  const ready = count === total;

  return (
    <span className="flex items-center gap-2">
      <span
        role="img"
        aria-label={`${count} of ${total} sections filled`}
        className="flex flex-1 gap-1"
      >
        {RESUME_SECTIONS.map((section) => {
          const isFilled = filled.includes(section);
          return (
            <span
              key={section}
              title={`${section} — ${isFilled ? "filled" : "empty"}`}
              className={`h-[3px] flex-1 rounded-full ${
                isFilled ? "bg-primary" : "bg-stone-200 dark:bg-muted"
              }`}
            />
          );
        })}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-graphite tabular-nums">
        {ready && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
        {count}/{total}
      </span>
    </span>
  );
}
