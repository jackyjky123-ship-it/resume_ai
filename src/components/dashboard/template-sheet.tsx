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

function ProfessionalSheet() {
  return (
    <span className="flex w-full flex-col gap-[8px] p-3.5">
      <span className="flex items-center gap-3 border-b border-hairline pb-2.5">
        <span className="size-8 shrink-0 rounded-xl bg-foreground/25" />
        <span className="flex flex-1 flex-col gap-[5px]">
          <Bar w="60%" tone="ink" thick />
          <Bar w="40%" tone="line" />
        </span>
      </span>
      <span className="flex w-full flex-col gap-[6px] pt-0.5">
        <Bar w="28%" tone="ink" />
        <Bar w="95%" />
        <Bar w="88%" />
        <Bar w="92%" />
      </span>
    </span>
  );
}

function EditorialSheet() {
  return (
    <span className="flex w-full gap-2.5 p-3">
      {/* Left Sidebar */}
      <span className="flex w-[34%] shrink-0 flex-col gap-[5px]">
        <span className="my-0.5 block aspect-[3/4] w-full rounded bg-foreground/20" />
        <Bar w="55%" tone="ink" />
        <Bar w="90%" />
        <Bar w="80%" />
        <Bar w="50%" tone="ink" />
        <Bar w="75%" />
      </span>

      {/* Right Column */}
      <span className="flex flex-1 flex-col gap-[5px]">
        <Bar w="80%" tone="ink" thick />
        <span className="block h-[3px] w-[60%] rounded-full bg-[#3b6998]" />
        <Bar w="32%" tone="ink" />
        <Bar w="100%" />
        <Bar w="92%" />

        {/* Dashed Skill Highlights Box */}
        <span className="my-0.5 flex flex-col gap-[3px] rounded border border-dashed border-foreground/35 p-1 bg-foreground/[0.02]">
          <span className="flex gap-2">
            <Bar w="48%" />
            <Bar w="48%" />
          </span>
          <span className="flex gap-2">
            <Bar w="48%" />
            <Bar w="48%" />
          </span>
        </span>

        <Bar w="32%" tone="ink" />
        <Bar w="95%" />
        <Bar w="85%" />
        <Bar w="32%" tone="ink" />
        <Bar w="90%" />
      </span>
    </span>
  );
}

/** Crop of the top of a resume page — fills whatever container clips it. */
export function TemplateSheet({ templateId }: { templateId: TemplateId }) {
  if (templateId === "modern") return <ModernSheet />;
  if (templateId === "compact") return <CompactSheet />;
  if (templateId === "professional") return <ProfessionalSheet />;
  if (templateId === "editorial") return <EditorialSheet />;
  return <ClassicSheet />;
}
