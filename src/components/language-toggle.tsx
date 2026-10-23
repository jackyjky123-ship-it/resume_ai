"use client";

import { useLanguage } from "@/lib/i18n/context";

export function LanguageToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, toggleLocale, isKhmer } = useLanguage();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleLocale}
        title={isKhmer ? "Switch to English (EN)" : "Switch to Khmer (KH)"}
        aria-label="Toggle language"
        className={`grid size-8 place-items-center rounded-lg border border-hairline bg-white dark:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs ${className}`}
      >
        <span className="font-mono text-[11px] font-bold tracking-tight">
          {isKhmer ? "KH" : "EN"}
        </span>
      </button>
    );
  }

  const options: { value: "en" | "km"; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "km", label: "KH" },
  ];

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center rounded-lg border border-hairline bg-stone-100/70 dark:bg-muted/70 p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(opt.value)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              active
                ? "bg-white dark:bg-card text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-mono text-[11px] font-bold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
