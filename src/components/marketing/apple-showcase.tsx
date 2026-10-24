"use client";

import { useState } from "react";
import { CheckCircle2, Download, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type PreviewStyle = "editorial" | "designer" | "modern";

export function AppleShowcase() {
  const { isKhmer } = useLanguage();
  const [activeTab, setActiveTab] = useState<PreviewStyle>("editorial");

  return (
    <div className="relative mx-auto w-full max-w-[520px] select-none">
      {/* Ambient soft spotlight glow behind the showcase */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-gradient-to-tr from-primary/15 via-emerald-500/10 to-amber-500/10 opacity-70 blur-2xl dark:opacity-40"
      />

      {/* Main Studio Frame (Engineered like macOS / iPadOS Pro window) */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 dark:border-white/[0.1] dark:bg-[#161617] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)]">
        {/* Window Chrome Titlebar */}
        <div className="flex h-10 items-center justify-between border-b border-black/[0.06] bg-neutral-50/80 px-3.5 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#1c1c1e]/80">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>

          <div className="flex items-center gap-1 rounded-full bg-neutral-200/60 p-0.5 dark:bg-neutral-800/80">
            {(
              [
                { id: "editorial", label: isKhmer ? "ទម្រង់ទី១" : "Editorial" },
                { id: "designer", label: isKhmer ? "ទម្រង់ទី២" : "Designer" },
                { id: "modern", label: isKhmer ? "ទម្រង់ទី៣" : "Modern" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-700 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
              A4 Vector
            </span>
          </div>
        </div>

        {/* Live Resume Sheet Viewport */}
        <div className="relative bg-[#f5f5f7] p-3 sm:p-5 dark:bg-[#000000]">
          {/* A4 Paper Mock */}
          <div className="relative mx-auto rounded-lg bg-white p-5 text-neutral-800 shadow-sm transition-all duration-200 dark:bg-[#111112] dark:text-neutral-200">
            {activeTab === "editorial" && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                {/* Left Mini Sidebar */}
                <div className="w-[34%] shrink-0 border-r border-neutral-200 pr-3 text-[9.5px] dark:border-neutral-800">
                  <div className="mb-2 size-12 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                    <div className="flex size-full items-center justify-center font-display text-xs font-bold text-neutral-500">
                      AC
                    </div>
                  </div>
                  <p className="font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {isKhmer ? "ទំនាក់ទំនង" : "Contact"}
                  </p>
                  <p className="mt-1 text-neutral-500 truncate">amara@chen.dev</p>
                  <p className="text-neutral-500">+1 (415) 890-234</p>
                  <p className="text-neutral-500">San Francisco, CA</p>

                  <div className="my-2.5 h-px bg-neutral-200 dark:bg-neutral-800" />

                  <p className="font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {isKhmer ? "ជំនាញ" : "Skills"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {["TypeScript", "React", "Next.js", "Tailwind"].map((s) => (
                      <span
                        key={s}
                        className="rounded bg-neutral-100 px-1 py-0.5 text-[8.5px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Main Column */}
                <div className="min-w-0 flex-1 text-[10px]">
                  <h3 className="font-display text-base font-bold tracking-tight text-neutral-950 dark:text-white">
                    {isKhmer ? "អាម៉ារ៉ា ចេន" : "Amara Chen"}
                  </h3>
                  <p className="text-[10px] font-medium text-primary">
                    Senior Software Engineer
                  </p>

                  <p className="mt-2 text-[9px] leading-relaxed text-neutral-600 line-clamp-2 dark:text-neutral-400">
                    {isKhmer
                      ? "វិស្វករកម្មវិធីដែលមានបទពិសោធន៍ជាង ៥ ឆ្នាំក្នុងការកសាងប្រព័ន្ធ Cloud និង Frontend ដែលមានប្រសិទ្ធភាពខ្ពស់។"
                      : "Product-minded engineer with 5+ years building performant web apps and developer toolchains."}
                  </p>

                  <div className="my-2 h-px bg-neutral-200 dark:bg-neutral-800" />

                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {isKhmer ? "បទពិសោធន៍ការងារ" : "Experience"}
                  </p>
                  <div className="mt-1">
                    <div className="flex items-baseline justify-between text-[9.5px]">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        Lead Frontend Engineer
                      </span>
                      <span className="text-neutral-400">2022 – {isKhmer ? "បច្ចុប្បន្ន" : "Present"}</span>
                    </div>
                    <p className="text-[9px] text-neutral-500">Acme Labs · San Francisco</p>
                    <ul className="mt-1 list-disc pl-3 text-[9px] text-neutral-600 dark:text-neutral-400">
                      <li>Reduced bundle latency by 42% using streaming SSR.</li>
                      <li>Spearheaded design system adopted by 14 product teams.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "designer" && (
              <div className="flex flex-col gap-2.5 animate-in fade-in duration-300 text-[10px]">
                <div className="flex items-center gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-800">
                  <div className="size-11 shrink-0 rounded bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-white font-bold">
                    AC
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-neutral-950 dark:text-white">
                      Amara Chen
                    </h3>
                    <p className="text-[9.5px] font-medium text-neutral-500">
                      Apply for: Principal Product Designer
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[9px]">
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {isKhmer ? "បទពិសោធន៍" : "EXPERIENCE"}
                    </p>
                    <p className="mt-0.5 font-semibold text-neutral-800 dark:text-neutral-200">
                      Staff UI/UX Architect
                    </p>
                    <p className="text-neutral-500">Stripe · 2021 – 2025</p>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Designed checkout flows with $2B+ annual transaction volume.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {isKhmer ? "ការអប់រំ" : "EDUCATION"}
                    </p>
                    <p className="mt-0.5 font-semibold text-neutral-800 dark:text-neutral-200">
                      B.S. in Interaction Design
                    </p>
                    <p className="text-neutral-500">Stanford University · 2017–2021</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "modern" && (
              <div className="flex flex-col gap-2 animate-in fade-in duration-300 text-[10px]">
                <div className="-mx-5 -mt-5 rounded-t-lg bg-neutral-900 p-3.5 text-white dark:bg-neutral-800">
                  <h3 className="text-sm font-bold tracking-tight">Amara Chen</h3>
                  <p className="text-[9px] text-neutral-300">
                    Full-Stack Engineer & System Architect
                  </p>
                </div>
                <div className="pt-2 text-[9px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  <p className="font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    {isKhmer ? "សេចក្តីសង្ខេប" : "Executive Profile"}
                  </p>
                  <p className="mt-0.5">
                    Architecting distributed systems and responsive micro-frontends with high test coverage and sub-100ms response targets.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Pill Badges (Apple-style interactive overlays) */}
          <div className="pointer-events-none mt-3 flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
            {/* Badge 1: ATS */}
            <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/90 px-3 py-1 font-semibold text-neutral-800 shadow-sm backdrop-blur-md dark:border-white/[0.1] dark:bg-[#1c1c1e]/90 dark:text-neutral-200">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>ATS Score: 98/100</span>
            </div>

            {/* Badge 2: AI Sparkle */}
            <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/90 px-3 py-1 font-semibold text-neutral-800 shadow-sm backdrop-blur-md dark:border-white/[0.1] dark:bg-[#1c1c1e]/90 dark:text-neutral-200">
              <Sparkles size={12} className="text-amber-500" />
              <span>{isKhmer ? "កែសម្រួលជាមួយ AI" : "Gemini Polish"}</span>
            </div>

            {/* Badge 3: PDF */}
            <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/90 px-3 py-1 font-semibold text-neutral-800 shadow-sm backdrop-blur-md dark:border-white/[0.1] dark:bg-[#1c1c1e]/90 dark:text-neutral-200">
              <Download size={12} className="text-primary" />
              <span>Vector A4 PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
