"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FileText, KeyRound, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSampleResumeDocument } from "@/lib/sample-data";
import {
  mergeResumeDocuments,
  withFreshIds,
  type ImportApplyMode,
} from "@/lib/resume-import";
import { useApiKey } from "@/lib/api-key-context";
import type { CvImportResult } from "@/lib/validations/ai";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { ApiKeySettingsDialog } from "./api-key-settings";
import { ImportCvDialog } from "./import-cv-dialog";
import { GenerateCvDialog } from "./generate-cv-dialog";

export function CvTools() {
  const form = useFormContext<ResumeEditorFormValues>();
  const templateId = form.watch("templateId") ?? "classic";
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
        "Load sample resume? This will populate the editor with complete sample career data."
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
    toast.success("Loaded sample resume data. Autosave will save your changes.");
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
        ? "Imported CV merged into the editor. Review it before leaving."
        : "Imported CV applied. Review it before leaving."
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            title="Populate resume with sample data"
          >
            <FileText className="size-3.5" />
            Sample Data
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setKeySettingsOpen(true)}
            title="Configure your Gemini API key"
          >
            <KeyRound className="size-3.5" />
            API Key
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
          >
            <Upload />
            Update CV
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setGenerateOpen(true)}
          >
            <Sparkles />
            Generate CV
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setKeySettingsOpen(true)}
          className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {hasKey ? "Gemini AI · Your API key" : "Demo AI · Local only (Add Key)"}
        </button>
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
