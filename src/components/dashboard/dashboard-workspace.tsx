"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import {
  TEMPLATE_NAME,
  type DashboardResume,
  type TemplateId,
} from "@/lib/resume-meta";
import type { StarterRole } from "@/lib/validations/resume";
import {
  createResumeAction,
  deleteResumeAction,
  duplicateResumeAction,
  renameResumeAction,
} from "@/server/actions/resume.actions";
import { EmptyState } from "./empty-state";
import {
  NewResumeDialog,
  DeleteResumeDialog,
  RenameResumeDialog,
} from "./resume-dialogs";
import { ResumeCard } from "./resume-card";
import { ResumeToolbar, type SortKey, type TemplateFilter } from "./resume-toolbar";

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

export function DashboardWorkspace({
  user,
  resumes: initialResumes,
}: {
  user: DashboardUser;
  resumes: DashboardResume[];
}) {
  const router = useRouter();
  const { hasKey } = useApiKey();
  const { t, isKhmer } = useLanguage();
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
    const base: Record<TemplateId, number> = {
      classic: 0,
      modern: 0,
      compact: 0,
      professional: 0,
      editorial: 0,
      designer: 0,
    };
    for (const resume of resumes) base[resume.templateId] += 1;
    return base;
  }, [resumes]);

  // Analytics ("Static Use" metrics)
  const topTemplateInfo = useMemo(() => {
    if (resumes.length === 0) return { name: "Template 05", count: 0 };
    let bestId: TemplateId = "editorial";
    let max = -1;
    for (const [id, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        bestId = id as TemplateId;
      }
    }
    return { name: TEMPLATE_NAME[bestId], count: max };
  }, [resumes, counts]);

  const avgCompletion = useMemo(() => {
    if (resumes.length === 0) return 0;
    const filledTotal = resumes.reduce((acc, r) => acc + (r.filledSections?.length || 0), 0);
    const maxSections = resumes.length * 5;
    return Math.min(100, Math.round((filledTotal / maxSections) * 100));
  }, [resumes]);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        openCreateDialog();
        return;
      }

      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
        searchInput?.focus();
        return;
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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

  async function handleCreateWithStarter(
    starterRole: StarterRole,
    templateId: TemplateId,
    title: string
  ) {
    setPending("create");
    setDialogError(null);
    const result = await createResumeAction({ title, templateId, starterRole });
    setPending(null);

    if (!result.ok) {
      setDialogError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(`Created “${result.data.title}” with student starter bullets.`);
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
    <div suppressHydrationWarning className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t.dashboard.title}
            </h1>
            <span className="font-mono text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
              v1.0 • open-source
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.dashboard.welcomeUser.replace("{name}", displayName)}. {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            aria-label="New resume"
            onClick={openCreateDialog}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-xs cursor-pointer gap-2 h-9 px-3.5 rounded-lg active:scale-95 transition-all"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            <span>{t.dashboard.newResume}</span>
            <span className="sr-only">New resume</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-primary-foreground/80 bg-primary-foreground/15 px-1.5 py-0.5 rounded ml-1">
              ⌘N
            </kbd>
          </Button>
        </div>
      </div>

      {/* "See Static Use" — Usage Statistics Section */}
      <section aria-label="Usage Analytics" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="size-3.5 text-primary" />
            {isKhmer ? "ស្ថិតិនៃការប្រើប្រាស់" : "Usage Statistics"}
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">telemetry.live</span>
        </div>

        <div className="rounded-xl border border-hairline bg-card shadow-2xs divide-y divide-hairline sm:divide-y-0 sm:divide-x sm:grid sm:grid-cols-4 overflow-hidden">
          {/* Metric 1: Total Documents */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{isKhmer ? "ឯកសារសរុប" : "Total Documents"}</span>
              <FileText className="size-3.5 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-foreground">
                {String(resumes.length).padStart(2, "0")}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{isKhmer ? "ឯកសារ" : "files"}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {resumes.length === 1 ? (isKhmer ? "១ សេចក្តីព្រាងសកម្ម" : "1 active draft") : `${resumes.length} ${isKhmer ? "សេចក្តីព្រាង" : "autosaved drafts"}`}
            </p>
          </div>

          {/* Metric 2: Primary Template */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{isKhmer ? "គំរូចម្បង" : "Primary Style"}</span>
              <LayoutTemplate className="size-3.5 text-primary" />
            </div>
            <div className="mt-3">
              <span className="font-display text-base font-bold text-foreground">
                {topTemplateInfo.name}
              </span>
            </div>
            <div className="mt-1">
              <Link
                href="/dashboard/templates"
                className="font-mono text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                {isKhmer ? "ស្វែងរកគំរូទាំងអស់" : "browse gallery"} <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Metric 3: Content Completeness */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{isKhmer ? "ភាពពេញលេញមធ្យម" : "Avg. Completion"}</span>
              <CheckCircle2 className="size-3.5 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-foreground">
                {avgCompletion}%
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{isKhmer ? "ការរួចរាល់" : "readiness"}</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((step) => {
                const active = avgCompletion >= (step + 1) * 20;
                return (
                  <span
                    key={step}
                    className={`h-1 flex-1 rounded-full ${
                      active ? "bg-primary" : "bg-hairline"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Metric 4: AI Copilot */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{isKhmer ? "ម៉ាស៊ីន AI" : "AI Engine"}</span>
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  hasKey ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="font-mono text-xs font-bold text-foreground">
                {hasKey ? "Gemini 2.5 Flash" : isKhmer ? "AI សាកល្បង" : "Local Mock"}
              </span>
            </div>
            <div className="mt-1">
              <Link
                href="/dashboard/api"
                className="font-mono text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                {hasKey
                  ? isKhmer
                    ? "បានភ្ជាប់ (BYOK) →"
                    : "connected (BYOK) →"
                  : isKhmer
                    ? "ភ្ជាប់ API key →"
                    : "connect API key →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* "See All Data" — Resumes Table/Grid */}
      <section aria-label="Your resumes" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {t.dashboard.resumesTitle}
            </h2>
            <p className="text-xs text-muted-foreground">
              {resumes.length} {isKhmer ? "ឯកសារក្នុងគណនីរបស់អ្នក" : resumes.length === 1 ? "document indexed in database" : "documents indexed in database"}
            </p>
          </div>
        </div>

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

        <div className="mt-4">
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
              onSelectStarter={handleCreateWithStarter}
              isCreating={pending === "create"}
            />
          )}
        </div>
      </section>

      <footer className="pt-6 border-t border-hairline text-center text-xs text-muted-foreground">
        {isKhmer
          ? "រក្សាភាពឯកជនក្នុងគណនីរបស់អ្នក — រាល់ការកែសម្រួលត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិកំឡុងពេលវាយបញ្ចូល។"
          : "Private to your account — every edit autosaves automatically as you type."}
      </footer>

      {/* Dialogs */}
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
