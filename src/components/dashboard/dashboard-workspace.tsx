"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Wordmark } from "@/components/wordmark";
import type { DashboardResume, TemplateId } from "@/lib/resume-meta";
import {
  createResumeAction,
  deleteResumeAction,
  duplicateResumeAction,
  renameResumeAction,
} from "@/server/actions/resume.actions";
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

export function DashboardWorkspace({
  user,
  resumes: initialResumes,
}: {
  user: DashboardUser;
  resumes: DashboardResume[];
}) {
  const router = useRouter();
  const [resumes, setResumes] = useState<DashboardResume[]>(initialResumes);
  const [query, setQuery] = useState("");
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("edited");
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DashboardResume | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardResume | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

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
        if (sortKey === "created")
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [resumes, query, templateFilter, sortKey]);

  const counts = useMemo(() => {
    const base: Record<TemplateId, number> = { classic: 0, modern: 0, compact: 0 };
    for (const resume of resumes) base[resume.templateId] += 1;
    return base;
  }, [resumes]);

  function openCreateDialog() {
    setDialogError(null);
    setCreateOpen(true);
  }

  async function handleCreate(title: string, templateId: TemplateId) {
    setPending("create");
    setDialogError(null);
    const result = await createResumeAction({ title, templateId });
    setPending(null);

    if (!result.ok) {
      setDialogError(result.error);
      return;
    }

    setCreateOpen(false);
    setQuery("");
    setTemplateFilter("all");
    setSortKey("edited");
    toast.success(`Created “${result.data.title}”.`);
    router.push(`/resumes/${result.data.id}/edit`);
  }

  async function handleRename(title: string) {
    if (!renameTarget) return;
    setPending("rename");
    setDialogError(null);
    const result = await renameResumeAction({ resumeId: renameTarget.id, title });
    setPending(null);

    if (!result.ok) {
      setDialogError(result.error);
      return;
    }

    const renamed = result.data;
    setResumes((current) =>
      current.map((resume) => (resume.id === renamed.id ? renamed : resume))
    );
    setRenameTarget(null);
    toast.success(`Renamed to “${renamed.title}”.`);
  }

  async function handleDuplicate(source: DashboardResume) {
    setPending(`duplicate:${source.id}`);
    const result = await duplicateResumeAction(source.id);
    setPending(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setResumes((current) => [result.data, ...current]);
    setQuery("");
    setTemplateFilter("all");
    setSortKey("edited");
    toast.success(`Duplicated “${source.title}”.`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setPending("delete");
    setDialogError(null);
    const result = await deleteResumeAction(deleteTarget.id);
    setPending(null);

    if (!result.ok) {
      setDialogError(result.error);
      return;
    }

    setResumes((current) => current.filter((resume) => resume.id !== result.data.id));
    toast.success(`Deleted “${deleteTarget.title}”.`);
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
          onCreate={openCreateDialog}
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
                  busy={pending === `duplicate:${resume.id}` || pending === "delete"}
                  onOpen={() => router.push(`/resumes/${resume.id}/edit`)}
                  onRename={(target) => {
                    setDialogError(null);
                    setRenameTarget(target);
                  }}
                  onDuplicate={handleDuplicate}
                  onDelete={(target) => {
                    setDialogError(null);
                    setDeleteTarget(target);
                  }}
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
              onCreate={openCreateDialog}
            />
          )}
        </section>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-graphite">
          <span aria-hidden className="ig-line size-1.5 shrink-0 rounded-full" />
          Private to your account — every edit autosaves as you go.
        </p>
      </main>

      <NewResumeDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        pending={pending === "create"}
        error={dialogError}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <RenameResumeDialog
        key={renameTarget?.id ?? "rename-none"}
        resume={renameTarget}
        pending={pending === "rename"}
        error={dialogError}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />
      <DeleteResumeDialog
        resume={deleteTarget}
        pending={pending === "delete"}
        error={dialogError}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
