export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="ig-ring grid size-9 shrink-0 place-items-center rounded-[10px] p-[2px]">
        <span className="grid size-full place-items-center rounded-[8px] bg-white">
          <span aria-hidden className="size-3.5 rounded-full border-2 border-foreground" />
        </span>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Resume<span className="text-ig">AI</span>
      </span>
    </span>
  );
}
