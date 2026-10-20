"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  mergeResumeDocuments,
  withFreshIds,
  type ImportApplyMode,
} from "@/lib/resume-import";
import type { AiMode, CvImportResult } from "@/lib/validations/ai";
import type { ResumeEditorFormValues } from "@/lib/validations/resume";
import { ImportCvDialog } from "./import-cv-dialog";
import { GenerateCvDialog } from "./generate-cv-dialog";

export function CvTools({ aiMode }: { aiMode: AiMode }) {
  const form = useFormContext<ResumeEditorFormValues>();
  const [importOpen, setImportOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  function applyImport(
    document: CvImportResult["document"],
    mode: ImportApplyMode
  ) {
    const current = form.getValues("content");
    const next =
      mode === "merge"
        ? mergeResumeDocuments(current, document)
        : withFreshIds(document);

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
        {aiMode === "mock" && (
          <span className="text-[10px] font-medium text-muted-foreground">
            Demo AI · local only
          </span>
        )}
      </div>

      {importOpen && (
        <ImportCvDialog
          open
          onOpenChange={setImportOpen}
          aiMode={aiMode}
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
