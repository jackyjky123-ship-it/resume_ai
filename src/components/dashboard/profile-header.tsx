"use client";

import { Plus } from "lucide-react";

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
  return (
    <section className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <span className="niseth-ring grid size-20 shrink-0 place-items-center rounded-full p-[3px] shadow-sm sm:size-24">
        <span className="grid size-full place-items-center rounded-full bg-white p-[3px]">
          <span className="niseth-avatar grid size-full place-items-center rounded-full font-display text-2xl font-bold text-[#f0ede5] sm:text-3xl">
            {initials}
          </span>
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#102422] sm:text-3xl">
            {displayName}
          </h1>
          <span className="rounded-full border border-[#004643]/20 bg-[#f0ede5] px-3.5 py-1 text-[11px] font-bold text-[#004643]">
            Niseth Code Member
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-[#586e6b]">{email}</p>
        <p className="mt-3 text-sm text-[#586e6b]">
          <span className="font-semibold text-[#102422] tabular-nums">{resumeCount}</span>{" "}
          {resumeCount === 1 ? "resume" : "resumes"}
          <span aria-hidden className="mx-2 text-[#e2ded5]">
            ·
          </span>
          Encrypted & private to your account
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#004643] px-7 py-3 text-[15px] font-semibold text-[#f0ede5] shadow-md transition hover:bg-[#003330] hover:shadow-lg sm:w-auto"
      >
        <Plus size={17} strokeWidth={2.4} aria-hidden />
        New resume
      </button>
    </section>
  );
}
