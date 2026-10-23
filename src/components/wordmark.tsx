export function Wordmark({
  className,
  light,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      className={`font-display text-lg font-bold tracking-tight select-none ${
        light ? "text-white" : "text-foreground"
      } ${className ?? ""}`}
    >
      Niseth <span className={light ? "text-[#dda15e]" : "text-primary"}>Code</span>
    </span>
  );
}
