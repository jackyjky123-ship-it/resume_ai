"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormProvider,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CloudUpload,
  Download,
  Eye,
  LayoutPanelLeft,
  PenLine,
  TriangleAlert,
} from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TEMPLATES, type TemplateId } from "@/lib/resume-meta";
import { ApiKeyProvider, useApiKey } from "@/lib/api-key-context";
import {
  resumeEditorSchema,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import type { ResumeDetail } from "@/server/services/resume.service";
import { ResumePreview } from "@/components/resume-preview/resume-preview";
import { ApiKeySettingsDialog } from "./api-key-settings";
import { CertificationsSection } from "./certifications-section";
import { CvTools } from "./cv-tools";
import { EducationSection } from "./education-section";
import { ExperienceSection } from "./experience-section";
import { LanguagesSection } from "./languages-section";
import { ReferencesSection } from "./references-section";
import { PersonalSection, SummarySection } from "./personal-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
import { useResumeAutosave, type SaveStatus } from "./use-resume-autosave";

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  const { t } = useLanguage();

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <Spinner />
        {t.common.saving}
      </span>
    );
  }

  if (status === "dirty") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
        <PenLine className="size-3" aria-hidden />
        {t.common.unsaved}
      </span>
    );
  }

  if (status === "invalid") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 text-xs font-medium text-destructive dark:text-red-300">
        <TriangleAlert className="size-3" aria-hidden />
        {t.common.fixFields}
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 text-xs font-medium text-destructive underline underline-offset-2 hover:bg-red-100 dark:hover:bg-red-900/60"
      >
        <TriangleAlert className="size-3" aria-hidden />
        {t.common.saveFailed}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
      <Check className="size-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
      {t.common.saved}
    </span>
  );
}

function SectionNav() {
  const { t } = useLanguage();
  const sectionLinks = [
    { id: "section-personal", label: t.editor.sectionPersonal },
    { id: "section-summary", label: t.editor.sectionSummary },
    { id: "section-experience", label: t.editor.sectionExperience },
    { id: "section-education", label: t.editor.sectionEducation },
    { id: "section-skills", label: t.editor.sectionSkills },
    { id: "section-projects", label: t.editor.sectionProjects },
    { id: "section-certifications", label: t.editor.sectionCertifications },
    { id: "section-languages", label: t.editor.sectionLanguages },
    { id: "section-references", label: t.editor.sectionReferences },
  ];

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Editor sections"
      className="sticky top-16 z-20 -mx-1 mb-6 flex gap-1.5 overflow-x-auto bg-background/95 px-1 py-2.5 backdrop-blur no-scrollbar"
    >
      {sectionLinks.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollTo(section.id)}
          className="shrink-0 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs transition-colors duration-150 hover:border-primary/40 hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}

function GlobalApiKeyModal() {
  const { isKeyDialogOpen, setKeyDialogOpen } = useApiKey();

  useEffect(() => {
    const handleOpen = () => setKeyDialogOpen(true);
    window.addEventListener("resumeai:open-key-modal", handleOpen);
    return () => window.removeEventListener("resumeai:open-key-modal", handleOpen);
  }, [setKeyDialogOpen]);

  return (
    <ApiKeySettingsDialog
      open={isKeyDialogOpen}
      onOpenChange={setKeyDialogOpen}
    />
  );
}

export function ResumeEditor({
  resume,
}: {
  resume: ResumeDetail;
}) {
  const defaults = useMemo<ResumeEditorFormValues>(
    () => ({
      title: resume.title,
      templateId: resume.templateId,
      content: resume.content,
    }),
    [resume]
  );

  const form = useForm<ResumeEditorFormValues>({
    // Zod defaults make the schema's output type wider than its input type;
    // the form always holds defaulted values, so pin the resolver to the output.
    resolver: zodResolver(resumeEditorSchema) as Resolver<ResumeEditorFormValues>,
    defaultValues: defaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const router = useRouter();
  const { t, isKhmer } = useLanguage();
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
  const { status, saveNow, hasUnsavedChanges } = useResumeAutosave(resume.id, form);

  const content =
    useWatch({ control: form.control, name: "content" }) ?? resume.content;
  const templateId =
    useWatch({ control: form.control, name: "templateId" }) ?? resume.templateId;

  const handleManualSave = useCallback(async () => {
    try {
      setIsSavingAndExiting(true);
      const saved = await saveNow();
      if (saved) {
        toast.success(
          isKhmer
            ? "បានរក្សាទុកប្រវត្តិរូប។ កំពុងត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង…"
            : "Resume saved. Returning to dashboard…"
        );
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error(
        isKhmer
          ? "មិនអាចរក្សាទុកប្រវត្តិរូបបានទេ។ សូមព្យាយាមម្តងទៀត។"
          : "Couldn’t save resume. Please try again."
      );
    } finally {
      setIsSavingAndExiting(false);
    }
  }, [saveNow, router, isKhmer]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      setIsDownloadingPdf(true);
      // Ensure any pending changes are saved before downloading
      await saveNow();

      const response = await fetch(`/api/resumes/${resume.id}/pdf`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || (isKhmer ? "បរាជ័យក្នុងការបង្កើតឯកសារ PDF។" : "Failed to generate resume PDF."));
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      let filename = "Resume.pdf";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(objectUrl);

      toast.success(isKhmer ? "បានទាញយកឯកសារ PDF ដោយជោគជ័យ។" : "PDF downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isKhmer
            ? "មិនអាចទាញយក PDF បានទេ។"
            : "Couldn't download resume PDF."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [resume.id, saveNow, isKhmer]);

  const handleBackClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        hasUnsavedChanges() &&
        !window.confirm(
          isKhmer
            ? "អ្នកមានការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុក។ តើអ្នកចង់ចាកចេញឬទេ?"
            : "You have unsaved changes. Leave the editor anyway?"
        )
      ) {
        event.preventDefault();
      }
    },
    [hasUnsavedChanges, isKhmer]
  );

  return (
    <ApiKeyProvider>
      <FormProvider {...form}>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-30 border-b border-hairline bg-card/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6">
            <Link
              href="/dashboard"
              prefetch={false}
              onClick={handleBackClick}
              className="grid size-9 shrink-0 place-items-center rounded-full text-graphite hover:bg-muted hover:text-foreground sm:hidden"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
            <Link
              href="/dashboard"
              prefetch={false}
              onClick={handleBackClick}
              className="hidden shrink-0 items-center sm:flex"
              aria-label="Back to dashboard"
            >
              <Wordmark />
            </Link>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="group relative flex min-w-0 max-w-md items-center">
                <Input
                  aria-label="Resume title"
                  maxLength={80}
                  className="h-9 w-full rounded-lg border-transparent bg-transparent px-2 font-display text-base font-bold text-foreground transition hover:bg-muted/50 focus-visible:border-border focus-visible:bg-card focus-visible:ring-1 focus-visible:ring-primary sm:text-lg"
                  {...form.register("title")}
                />
              </div>
              <span className="hidden sm:inline-flex">
                <SaveIndicator status={status} onRetry={() => void saveNow()} />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggle compact />
              <ThemeToggle compact />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isDownloadingPdf || isSavingAndExiting}
                onClick={() => void handleDownloadPdf()}
                aria-label={t.editor.exportPdf}
                className="h-9 gap-1.5"
              >
                {isDownloadingPdf ? (
                  <Spinner />
                ) : (
                  <Download className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {isDownloadingPdf ? t.editor.exporting : t.editor.exportPdf}
                </span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSavingAndExiting}
                onClick={() => void handleManualSave()}
                aria-label="Save and return to dashboard"
                className="h-9 gap-1.5 shadow-xs"
              >
                {isSavingAndExiting ? (
                  <Spinner />
                ) : (
                  <CloudUpload className="size-4" />
                )}
                <span className="hidden sm:inline">
                  {isSavingAndExiting ? t.common.saving : t.common.save}
                </span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:hidden">
            <ToggleGroup
              type="single"
              value={mobileView}
              onValueChange={(value) => {
                if (value === "editor" || value === "preview") setMobileView(value);
              }}
              aria-label="Switch between editor and preview"
            >
              <ToggleGroupItem value="editor" size="sm">
                <LayoutPanelLeft />
                {t.editor.editForm}
              </ToggleGroupItem>
              <ToggleGroupItem value="preview" size="sm">
                <Eye />
                {t.editor.livePreview}
              </ToggleGroupItem>
            </ToggleGroup>
            <SaveIndicator status={status} onRetry={() => void saveNow()} />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,46%)]">
            <div className={mobileView === "editor" ? "block" : "hidden lg:block"}>
              <CvTools />
              <SectionNav />
              <form
                className="flex flex-col gap-6"
                onSubmit={(event) => event.preventDefault()}
                noValidate
              >
                <PersonalSection />
                <SummarySection />
                <ExperienceSection />
                <EducationSection />
                <SkillsSection />
                <ProjectsSection />
                <CertificationsSection />
                <LanguagesSection />
                <ReferencesSection />
              </form>
            </div>

            <aside
              aria-label="Preview"
              className={
                mobileView === "preview"
                  ? "block"
                  : "hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-auto"
              }
            >
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-foreground">
                    {t.editor.livePreview}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {isKhmer ? "ទំព័រ A4" : "A4 Document"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={templateId}
                    onValueChange={(value) =>
                      form.setValue("templateId", value as TemplateId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger size="sm" aria-label="Template" className="h-8.5 w-40 rounded-lg border-border/80 bg-card text-foreground font-medium shadow-2xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-2xl border border-border/80 bg-stone-100/90 dark:bg-muted/30 p-3 sm:p-5 shadow-xs">
                <ResumePreview document={content} templateId={templateId} />
              </div>
            </aside>
          </div>
        </div>
      </div>
      </FormProvider>
      <GlobalApiKeyModal />
    </ApiKeyProvider>
  );
}
