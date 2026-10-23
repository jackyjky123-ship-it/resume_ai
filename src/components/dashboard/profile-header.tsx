"use client";

import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type ProfileHeaderProps = {
  displayName: string;
  email: string;
  initials: string;
  resumeCount: number;
  onCreate: () => void;
};

export function ProfileHeader({
  displayName,
  email,
  initials,
  resumeCount,
  onCreate,
}: ProfileHeaderProps) {
  const { t, isKhmer } = useLanguage();

  return (
    <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <span className="niseth-ring grid size-16 shrink-0 place-items-center rounded-full p-[2.5px] shadow-sm sm:size-20">
          <span className="grid size-full place-items-center rounded-full bg-white p-[2px]">
            <span className="niseth-avatar grid size-full place-items-center rounded-full font-display text-xl font-bold text-[#f0ede5] sm:text-2xl">
              {initials}
            </span>
          </span>
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="font-display text-xl font-bold tracking-tight text-[#102422] sm:text-2xl">
              {displayName}
            </h1>
            <span className="rounded-full border border-[#004643]/20 bg-[#f0ede5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#004643]">
              {isKhmer ? "សមាជិក" : "Member"}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-[#586e6b]">{email}</p>
          <p className="mt-1.5 text-xs text-[#586e6b]">
            <span className="font-semibold text-[#102422] tabular-nums">{resumeCount}</span>{" "}
            {isKhmer ? "ប្រវត្តិរូប" : resumeCount === 1 ? "resume" : "resumes"}
            <span aria-hidden className="mx-2 text-[#e2ded5]">
              ·
            </span>
            <span>{isKhmer ? "រក្សាទុកស្វ័យប្រវត្តិ & ឯកជន" : "Autosaved & Private"}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#004643] px-6 py-3 text-sm font-semibold text-[#f0ede5] shadow-xs transition-all duration-150 hover:bg-[#003330] hover:shadow-md active:scale-98 cursor-pointer sm:w-auto"
      >
        <Plus size={16} strokeWidth={2.4} aria-hidden />
        {t.dashboard.newResume}
      </button>
    </section>
  );
}
