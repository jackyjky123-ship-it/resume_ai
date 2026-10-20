"use client";

import { useCallback, useMemo, useState } from "react";
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
import type { AiMode } from "@/lib/validations/ai";
import {
  resumeEditorSchema,
  type ResumeEditorFormValues,
} from "@/lib/validations/resume";
import type { ResumeDetail } from "@/server/services/resume.service";
import { ResumePreview } from "@/components/resume-preview/resume-preview";
import { CertificationsSection } from "./certifications-section";
import { CvTools } from "./cv-tools";
import { EducationSection } from "./education-section";
import { ExperienceSection } from "./experience-section";
import { LanguagesSection } from "./languages-section";
import { PersonalSection, SummarySection } from "./personal-section";
import { ProjectsSection } from "./projects-section";
import { SkillsSection } from "./skills-section";
import { useResumeAutosave, type SaveStatus } from "./use-resume-autosave";

const SECTION_LINKS = [
  { id: "section-personal", label: "Personal" },
  { id: "section-summary", label: "Summary" },
  { id: "section-experience", label: "Experience" },
  { id: "section-education", label: "Education" },
  { id: "section-skills", label: "Skills" },
  { id: "section-projects", label: "Projects" },
  { id: "section-certifications", label: "Certifications" },
  { id: "section-languages", label: "Languages" },
] as const;

function SaveIndicator({ status, onRetry }: { status: SaveStatus; onRetry: () => void }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Spinner />
        Saving…
      </span>
    );
  }

  if (status === "dirty") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <PenLine className="size-3.5" aria-hidden />
        Unsaved changes
      </span>
    );
  }

  if (status === "invalid") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
        <TriangleAlert className="size-3.5" aria-hidden />
        Fix highlighted fields to save
      </span>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive underline underline-offset-2"
      >
        <TriangleAlert className="size-3.5" aria-hidden />
        Couldn’t save — retry
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Check className="size-3.5" aria-hidden />
      Saved
    </span>
  );
}

function SectionNav() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Editor sections"
      className="sticky top-16 z-20 -mx-1 mb-5 flex gap-1 overflow-x-auto bg-background/95 px-1 py-2 backdrop-blur"
    >
      {SECTION_LINKS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollTo(section.id)}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}

export function ResumeEditor({
  resume,
  aiMode,
}: {
  resume: ResumeDetail;
  aiMode: AiMode;
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
        toast.success("Resume saved. Returning to dashboard…");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Couldn’t save resume. Please try again.");
    } finally {
      setIsSavingAndExiting(false);
    }
  }, [saveNow, router]);

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
        throw new Error(body?.error || "Failed to generate resume PDF.");
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

      toast.success("PDF downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't download resume PDF."
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [resume.id, saveNow]);

  const handleBackClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        hasUnsavedChanges() &&
        !window.confirm("You have unsaved changes. Leave the editor anyway?")
      ) {
        event.preventDefault();
      }
    },
    [hasUnsavedChanges]
  );

  return (
    <FormProvider {...form}>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-30 border-b border-hairline bg-white/90 backdrop-blur">
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

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                aria-label="Resume title"
                maxLength={80}
                className="h-9 max-w-md border-transparent bg-transparent px-2 font-display text-lg font-bold shadow-none focus-visible:border-ring"
                {...form.register("title")}
              />
              <span className="hidden lg:inline-flex">
                <SaveIndicator status={status} onRetry={() => void saveNow()} />
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isDownloadingPdf || isSavingAndExiting}
                onClick={() => void handleDownloadPdf()}
                aria-label="Download resume PDF"
              >
                {isDownloadingPdf ? (
                  <Spinner />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                <span className="hidden sm:inline">
                  {isDownloadingPdf ? "Downloading…" : "Download PDF"}
                </span>
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSavingAndExiting}
                onClick={() => void handleManualSave()}
                aria-label="Save and return to dashboard"
              >
                {isSavingAndExiting ? (
                  <Spinner />
                ) : (
                  <CloudUpload data-icon="inline-start" />
                )}
                <span className="hidden sm:inline">
                  {isSavingAndExiting ? "Saving…" : "Save"}
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
                Edit
              </ToggleGroupItem>
              <ToggleGroupItem value="preview" size="sm">
                <Eye />
                Preview
              </ToggleGroupItem>
            </ToggleGroup>
            <SaveIndicator status={status} onRetry={() => void saveNow()} />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,46%)]">
            <div className={mobileView === "editor" ? "block" : "hidden lg:block"}>
              <SectionNav />
              <form
                className="flex flex-col gap-6"
                onSubmit={(event) => event.preventDefault()}
                noValidate
              >
                <PersonalSection action={<CvTools aiMode={aiMode} />} />
                <SummarySection />
                <ExperienceSection />
                <EducationSection />
                <SkillsSection />
                <ProjectsSection />
                <CertificationsSection />
                <LanguagesSection />
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
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">Live preview</h2>
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
                    <SelectTrigger size="sm" aria-label="Template" className="w-36">
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
              <div className="rounded-2xl border border-border bg-neutral-100 p-3 sm:p-5">
                <ResumePreview document={content} templateId={templateId} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
