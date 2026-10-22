export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#004643] text-[#F0EDE5] shadow-sm ring-1 ring-[#004643]/20">
        <svg
          className="size-4.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Stylized code brackets combined with document lines */}
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="10" y1="12" x2="14" y2="12" stroke="#dda15e" strokeWidth="2.8" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">
        Niseth <span className="text-[#004643]">Code</span>
      </span>
    </span>
  );
}
