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
      <span className="ig-ring grid size-20 shrink-0 place-items-center rounded-full p-[3px] sm:size-24">
        <span className="grid size-full place-items-center rounded-full bg-white p-[3px]">
          <span className="ig-avatar grid size-full place-items-center rounded-full font-display text-2xl font-bold text-white sm:text-3xl">
            {initials}
          </span>
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {displayName}
          </h1>
          <span className="rounded-full border border-hairline bg-white px-3 py-1 text-[11px] font-semibold text-graphite">
            Free plan
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-graphite">{email}</p>
        <p className="mt-3 text-sm text-graphite">
          <span className="font-semibold text-foreground tabular-nums">{resumeCount}</span>{" "}
          {resumeCount === 1 ? "resume" : "resumes"}
          <span aria-hidden className="mx-2 text-hairline">
            ·
          </span>
          Private to your account
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-action px-6 py-3 text-[15px] font-semibold text-white hover:bg-action-strong sm:w-auto"
      >
        <Plus size={17} strokeWidth={2.2} aria-hidden />
        New resume
      </button>
    </section>
  );
}
