"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`h-8 w-28 rounded-lg bg-hairline/40 animate-pulse ${className}`}
        aria-hidden
      />
    );
  }

  const options: { value: string; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Laptop },
  ];

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label="Toggle theme"
        className={`grid size-8 place-items-center rounded-lg border border-hairline bg-white dark:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-2xs ${className}`}
      >
        {theme === "dark" ? (
          <Sun className="size-4 text-amber-400" />
        ) : (
          <Moon className="size-4" />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Select theme appearance"
      className={`inline-flex items-center rounded-lg border border-hairline bg-stone-100/70 dark:bg-muted/70 p-0.5 ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              active
                ? "bg-white dark:bg-card text-foreground font-semibold shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            <span className="font-mono text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
