"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import {
  INITIAL_RESUMES,
  type DashboardResume,
  type TemplateId,
} from "@/lib/mock/dashboard";
import { EmptyState } from "./empty-state";
import { ProfileHeader } from "./profile-header";
import { NewResumeDialog, DeleteResumeDialog, RenameResumeDialog } from "./resume-dialogs";
import { ResumeCard } from "./resume-card";
import { ResumeToolbar, type SortKey, type TemplateFilter } from "./resume-toolbar";
import { SignOutButton } from "./sign-out-button";

type DashboardUser = { name: string | null; email: string };

function friendlyName(user: DashboardUser) {
  const provided = user.name?.trim();
  if (provided) return provided;
  const localPart = user.email.split("@")[0] ?? "there";
  return localPart
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function initialsOf(displayName: string) {
  const words = displayName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "R";
  const letters = words.slice(0, 2).map((word) => word.charAt(0));
  return letters.join("").toUpperCase();
}

export function DashboardWorkspace({ user }: { user: DashboardUser }) {
  const [resumes, setResumes] = useState<DashboardResume[]>(INITIAL_RESUMES);
  const [query, setQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("edited");
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DashboardResume | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardResume | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const displayName = friendlyName(user);
  const initials = initialsOf(displayName);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return resumes
      .filter((resume) => {
        const matchesQuery = !needle || resume.title.toLowerCase().includes(needle);
        const matchesTemplate =
          templateFilter === "all" || resume.templateId === templateFilter;
        return matchesQuery && matchesTemplate;
      })
      .sort((a, b) => {
        if (sortKey === "name") return a.title.localeCompare(b.title);
        if (sortKey === "created") return b.createdAt - a.createdAt;
        return b.updatedAt - a.updatedAt;
      });
  }, [resumes, query, templateFilter, sortKey]);

  const counts = useMemo(() => {
    const base: Record<TemplateId, number> = { classic: 0, modern: 0, compact: 0 };
    for (const resume of resumes) base[resume.templateId] += 1;
    return base;
  }, [resumes]);

  function showToast(message: string) {
    setToast(message);
  }

  function handleCreate(title: string, templateId: TemplateId) {
    const timestamp = Date.now();
    setResumes((current) => [
      {
        id: `res_${timestamp}`,
        title,
        templateId,
        createdAt: timestamp,
        updatedAt: timestamp,
        filledSections: [],
      },
      ...current,
    ]);
    setCreateOpen(false);
    setQuery("");
    setTemplateFilter("all");
    setSortKey("edited");
    showToast(`Created “${title}”.`);
  }

  function handleRename(title: string) {
    if (!renameTarget) return;
    setResumes((current) =>
      current.map((resume) =>
        resume.id === renameTarget.id ? { ...resume, title, updatedAt: Date.now() } : resume
      )
    );
    setRenameTarget(null);
    showToast(`Renamed to “${title}”.`);
  }

  function handleDuplicate(source: DashboardResume) {
    const timestamp = Date.now();
    setResumes((current) => [
      { ...source, id: `res_${timestamp}`, title: `${source.title} copy`, createdAt: timestamp, updatedAt: timestamp },
      ...current,
    ]);
    setQuery("");
    setTemplateFilter("all");
    showToast(`Duplicated “${source.title}”.`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setResumes((current) => current.filter((resume) => resume.id !== deleteTarget.id));
    showToast(`Deleted “${deleteTarget.title}”.`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-hairline bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="shrink-0" aria-label="ResumeAI home">
            <Wordmark />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm font-medium text-graphite sm:block">
              {displayName}
            </span>
            <span className="ig-ring grid size-9 shrink-0 place-items-center rounded-full p-[2px]">
              <span className="grid size-full place-items-center rounded-full bg-white p-[1.5px]">
                <span className="ig-avatar grid size-full place-items-center rounded-full text-[11px] font-bold text-white">
                  {initials}
                </span>
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-8 sm:pt-10">
        <ProfileHeader
          displayName={displayName}
          email={user.email}
          initials={initials}
          resumeCount={resumes.length}
          onCreate={() => setCreateOpen(true)}
        />

        <ResumeToolbar
          query={query}
          onQueryChange={setQuery}
          templateFilter={templateFilter}
          onTemplateFilterChange={setTemplateFilter}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          counts={counts}
          totalCount={resumes.length}
        />

        <section aria-label="Your resumes" className="mt-6">
          {visible.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onOpen={() =>
                    showToast("Editor coming soon — this preview is dashboard-only.")
                  }
                  onRename={setRenameTarget}
                  onDuplicate={handleDuplicate}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              filtered={resumes.length > 0}
              query={query}
              onClear={() => {
                setQuery("");
                setTemplateFilter("all");
              }}
              onCreate={() => setCreateOpen(true)}
            />
          )}
        </section>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-graphite">
          <span aria-hidden className="ig-line size-1.5 shrink-0 rounded-full" />
          Design preview — sign-in is real, resumes are sample data. Refreshing resets the list.
        </p>
      </main>

      <NewResumeDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <RenameResumeDialog
        key={renameTarget?.id ?? "rename-none"}
        resume={renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />
      <DeleteResumeDialog
        resume={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <p className="flex items-center gap-2.5 rounded-full border border-hairline bg-white px-4 py-2.5 text-sm font-medium shadow-[0_18px_40px_-20px_rgba(38,38,38,0.5)]">
            <span aria-hidden className="ig-line size-1.5 shrink-0 rounded-full" />
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}
