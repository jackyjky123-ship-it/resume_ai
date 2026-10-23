"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, FileText, KeyRound, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSampleResumeDocument } from "@/lib/sample-data";
import {
  mergeResumeDocuments,
  withFreshIds,
  type ImportApplyMode,
} from "@/lib/resume-import";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import type { CvImportResult } from "@/lib/validations/ai";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { ApiKeySettingsDialog } from "./api-key-settings";
import { ImportCvDialog } from "./import-cv-dialog";
import { GenerateCvDialog } from "./generate-cv-dialog";

export function CvTools() {
  const form = useFormContext<ResumeEditorFormValues>();
  const templateId = form.watch("templateId") ?? "classic";
  const { t, isKhmer } = useLanguage();
  const [importOpen, setImportOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [keySettingsOpen, setKeySettingsOpen] = useState(false);

  const { aiMode, hasKey } = useApiKey();

  function handleLoadSample() {
    const current = form.getValues("content");
    const hasExistingContent =
      Boolean(current.personal.fullName?.trim()) ||
      Boolean(current.summary?.trim()) ||
      (current.experience?.length ?? 0) > 0;

    if (
      hasExistingContent &&
      !window.confirm(
        isKhmer
          ? "តើអ្នកពិតជាចង់បញ្ចូលទិន្នន័យគំរូមែនទេ? សកម្មភាពនេះនឹងបំពេញទិន្នន័យការងារគំរូទាំងអស់ចូលក្នុងផ្ទាំងកែសម្រួល។"
          : "Load sample resume? This will populate the editor with complete sample career data."
      )
    ) {
      return;
    }

    const sample = createSampleResumeDocument();
    form.reset({ ...form.getValues(), content: sample });
    form.setValue("content", sample, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success(
      isKhmer
        ? "បានបញ្ចូលទិន្នន័យគំរូរួចរាល់។ ប្រព័ន្ធនឹងរក្សាទុកដោយស្វ័យប្រវត្តិ។"
        : "Loaded sample resume data. Autosave will save your changes."
    );
  }

  function applyImport(
    document: CvImportResult["document"],
    mode: ImportApplyMode
  ) {
    const current = form.getValues("content");
    const next =
      mode === "merge"
        ? mergeResumeDocuments(current, document)
        : withFreshIds(document);

    form.reset({ ...form.getValues(), content: next });
    form.setValue("content", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setImportOpen(false);
    toast.success(
      mode === "merge"
        ? (isKhmer ? "បានបញ្ចូល និងផ្គុំ CV រួចរាល់។" : "Imported CV merged into the editor. Review it before leaving.")
        : (isKhmer ? "បានអនុវត្ត CV រួចរាល់។" : "Imported CV applied. Review it before leaving.")
    );
  }

  return (
    <>
      <div className="mb-6 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-muted/40 to-card p-3.5 shadow-xs sm:p-4.5">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Assistant Info & Key Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              <span>{t.cvTools.aiCopilot}</span>
            </div>
            <span aria-hidden className="hidden text-muted-foreground/40 sm:inline">
              ·
            </span>
            <button
              type="button"
              onClick={() => setKeySettingsOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition cursor-pointer ${
                hasKey
                  ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60"
                  : "border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-900/60"
              }`}
              title="Click to configure your Gemini API Key"
            >
              {hasKey ? (
                <>
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>{isKhmer ? "Gemini សកម្ម" : "Gemini Active"}</span>
                </>
              ) : (
                <>
                  <KeyRound className="size-3 text-amber-600" />
                  <span>{isKhmer ? "សាកល្បង AI · បន្ថែម Key" : "Demo AI · Add Key"}</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLoadSample}
              title="Populate resume with sample data"
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <FileText className="size-3.5" />
              <span>{isKhmer ? "ទិន្នន័យគំរូ" : "Sample Data"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImportOpen(true)}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Upload className="size-3.5" />
              <span>{t.cvTools.importCv}</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setGenerateOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Sparkles className="size-3.5" />
              <span>{t.cvTools.generateCv}</span>
            </Button>
          </div>
        </div>
      </div>

      <ApiKeySettingsDialog
        open={keySettingsOpen}
        onOpenChange={setKeySettingsOpen}
      />

      {importOpen && (
        <ImportCvDialog
          open
          onOpenChange={setImportOpen}
          aiMode={aiMode}
          templateId={templateId}
          onApply={applyImport}
        />
      )}
      {generateOpen && (
        <GenerateCvDialog
          open
          onOpenChange={setGenerateOpen}
          aiMode={aiMode}
        />
      )}
    </>
  );
}
