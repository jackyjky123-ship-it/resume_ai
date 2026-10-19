import { Globe, Mail, MapPin, MoreHorizontal, Sparkles } from "lucide-react";

const STORY_SECTIONS = [
  "Contact",
  "Experience",
  "Education",
  "Skills",
  "Projects",
];

export function StoryCard() {
  return (
    <figure
      role="img"
      aria-label="A resume preview framed as an Instagram-style story: progress dashes for each resume section on top, the filled resume below, and an AI reply bar at the bottom."
      className="rise-in relative mx-auto w-[330px] max-w-full"
      style={{ animationDelay: "0.2s" }}
    >
      <div
        aria-hidden
        className="absolute left-2 right-1 top-4 -z-10 h-[97%] -rotate-3 rounded-2xl border border-hairline bg-white opacity-70"
      />
      <div className="relative rounded-2xl border border-hairline bg-white p-4 shadow-[0_30px_70px_-30px_rgba(38,38,38,0.25)]">
        <div className="flex items-center gap-2.5">
          <span className="ig-ring grid size-11 shrink-0 place-items-center rounded-full p-[2.5px]">
            <span className="grid size-full place-items-center rounded-full bg-white">
              <span className="ig-avatar grid size-full place-items-center rounded-full text-[13px] font-bold text-white">
                AC
              </span>
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight">
              amara.writes
            </p>
            <p className="text-[11px] text-graphite">Draft 2 · autosaved</p>
          </div>
          <MoreHorizontal size={16} className="ml-auto shrink-0 text-graphite" />
        </div>

        <div className="mt-3 flex gap-1" aria-hidden>
          {STORY_SECTIONS.map((section, i) => (
            <span
              key={section}
              className="dash relative h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/10"
            >
              <span
                className="absolute inset-0 rounded-full bg-foreground"
                style={{ animationDelay: `${0.45 + i * 0.3}s` }}
              />
            </span>
          ))}
        </div>
        <div aria-hidden className="mt-1.5 flex gap-1 text-[9px] font-medium text-graphite">
          {STORY_SECTIONS.map((section) => (
            <span key={section} className="flex-1">
              {section}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <p className="font-display text-[15px] font-bold leading-tight">
            Amara Chen
          </p>
          <p className="text-[11px] text-graphite">Frontend engineering student</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-graphite">
            <span className="inline-flex items-center gap-1">
              <MapPin size={10} /> Atlanta, GA
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail size={10} /> amara.chen@…
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe size={10} /> amara.dev
            </span>
          </div>

          <div className="my-3 h-px bg-hairline" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
            Experience
          </p>
          <p className="mt-1 text-[11px] leading-snug">
            <span className="font-semibold">Teaching Assistant</span>
            <span className="text-graphite"> · Ridgeview Code Lab · 2024–now</span>
          </p>
          <div className="mt-0.5 flex gap-1.5">
            <span className="mt-[5px] size-[3px] shrink-0 rounded-full bg-foreground" />
            <p className="text-[10.5px] leading-snug text-foreground/85">
              Ran 90-minute web-dev labs for 40 first-year students, twice a week.
            </p>
          </div>

          <div className="my-2.5 h-px bg-hairline" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
            Education
          </p>
          <p className="mt-1 text-[11px] leading-snug">
            <span className="font-semibold">B.S. Computer Science</span>
            <span className="text-graphite"> · Lakeshore State University</span>
          </p>
          <p className="text-[10.5px] text-graphite">Expected 2026</p>

          <div className="my-2.5 h-px bg-hairline" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
            Skills
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {["TypeScript", "React", "Figma", "Git"].map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-hairline px-2 py-0.5 text-[10px] font-medium"
              >
                {skill}
              </li>
            ))}
          </ul>

          <div className="my-2.5 h-px bg-hairline" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-foreground/55">
            Projects
          </p>
          <p className="mt-1 text-[11px] leading-snug">
            <span className="font-semibold">Bloom</span>
            <span className="text-graphite"> · study-group finder</span>
          </p>
          <p className="text-[10.5px] text-graphite">
            Next.js app used by 120 classmates weekly
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-hairline px-3.5 py-2">
          <Sparkles size={14} className="shrink-0 text-action" />
          <span className="truncate text-[11px] text-graphite">
            Ask AI to tighten a bullet…
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-action px-2.5 py-1 text-[10px] font-semibold text-white">
            Suggest
          </span>
        </div>
      </div>
    </figure>
  );
}
