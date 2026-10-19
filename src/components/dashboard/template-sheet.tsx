import type { TemplateId } from "@/lib/resume-meta";

type Tone = "ink" | "line" | "white" | "white-faint";

const TONES: Record<Tone, string> = {
  ink: "bg-foreground/75",
  line: "bg-foreground/15",
  white: "bg-white/90",
  "white-faint": "bg-white/45",
};

/** A single text bar in a mini page preview. Spans keep markup valid in buttons. */
function Bar({ w, tone = "line", thick = false }: { w: string; tone?: Tone; thick?: boolean }) {
  return (
    <span
      aria-hidden
      className={`block shrink-0 rounded-full ${thick ? "h-[5px]" : "h-[3px]"} ${TONES[tone]}`}
      style={{ width: w }}
    />
  );
}

function ClassicSheet() {
  return (
    <span className="flex w-full flex-col items-center gap-[7px] p-4">
      <Bar w="54%" tone="ink" thick />
      <Bar w="32%" />
      <span className="my-1 block h-px w-full bg-hairline" />
      <span className="flex w-full flex-col gap-[7px]">
        <Bar w="24%" tone="ink" />
        <Bar w="94%" />
        <Bar w="87%" />
        <Bar w="91%" />
      </span>
      <span className="mt-1 flex w-full flex-col gap-[7px]">
        <Bar w="24%" tone="ink" />
        <Bar w="88%" />
        <Bar w="79%" />
        <Bar w="84%" />
      </span>
      <span className="mt-1 flex w-full flex-col gap-[7px]">
        <Bar w="24%" tone="ink" />
        <Bar w="90%" />
        <Bar w="72%" />
      </span>
    </span>
  );
}

function ModernSheet() {
  return (
    <span className="flex w-full flex-col">
      <span className="ig-panel flex flex-col gap-[7px] px-4 py-4">
        <Bar w="46%" tone="white" thick />
        <Bar w="30%" tone="white-faint" />
      </span>
      <span className="flex w-full flex-col gap-[7px] p-4">
        <Bar w="22%" tone="ink" />
        <Bar w="92%" />
        <Bar w="85%" />
        <span className="flex w-full flex-col gap-[7px] pt-2">
          <Bar w="22%" tone="ink" />
          <Bar w="88%" />
          <Bar w="80%" />
          <Bar w="86%" />
        </span>
      </span>
    </span>
  );
}

function CompactSheet() {
  return (
    <span className="flex w-full flex-col gap-[9px] p-3.5">
      <Bar w="50%" tone="ink" thick />
      <Bar w="30%" />
      <span className="flex gap-3 pt-1">
        <span className="flex w-[32%] flex-col gap-[7px]">
          <Bar w="72%" />
          <Bar w="58%" />
          <Bar w="64%" />
          <Bar w="50%" />
          <Bar w="66%" />
        </span>
        <span className="flex flex-1 flex-col gap-[7px]">
          <Bar w="30%" tone="ink" />
          <Bar w="97%" />
          <Bar w="84%" />
          <Bar w="30%" tone="ink" />
          <Bar w="90%" />
          <Bar w="74%" />
          <Bar w="30%" tone="ink" />
          <Bar w="82%" />
        </span>
      </span>
    </span>
  );
}

/** Crop of the top of a resume page — fills whatever container clips it. */
export function TemplateSheet({ templateId }: { templateId: TemplateId }) {
  if (templateId === "modern") return <ModernSheet />;
  if (templateId === "compact") return <CompactSheet />;
  return <ClassicSheet />;
}
