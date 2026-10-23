"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

import { ResumePreview } from "@/components/resume-preview/resume-preview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  CV_IMPORT_ACCEPT,
  CV_IMPORT_MAX_BYTES,
  formatFileSize,
  isSupportedCvFile,
} from "@/lib/cv-files";
import {
  hasImportableContent,
  type ImportApplyMode,
} from "@/lib/resume-import";
import type { AiMode, CvImportResult } from "@/lib/validations/ai";
import { useApiKey } from "@/lib/api-key-context";
import { resumeDocumentSchema } from "@/lib/validations/resume";
import type { TemplateId } from "@/lib/resume-meta";

type ImportCvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiMode?: AiMode;
  templateId?: TemplateId;
  onApply: (document: CvImportResult["document"], mode: ImportApplyMode) => void;
};

type ImportResponse =
  | ({ ok: true; document?: unknown; error?: undefined } & Omit<
      CvImportResult,
      "document"
    >)
  | { ok: false; error: string };

function documentSummary(document: CvImportResult["document"]) {
  return [
    `${document.experience.length} role${document.experience.length === 1 ? "" : "s"}`,
    `${document.education.length} education`,
    `${document.skills.length} skill${document.skills.length === 1 ? "" : "s"}`,
    `${document.projects.length} project${document.projects.length === 1 ? "" : "s"}`,
    `${document.languages.length} language${document.languages.length === 1 ? "" : "s"}`,
  ];
}

export function ImportCvDialog({
  open,
  onOpenChange,
  aiMode: propAiMode,
  templateId,
  onApply,
}: ImportCvDialogProps) {
  const { apiKey, aiMode: contextAiMode } = useApiKey();
  const effectiveAiMode = propAiMode ?? contextAiMode;

  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [result, setResult] = useState<CvImportResult | null>(null);
  const [applyMode, setApplyMode] = useState<ImportApplyMode>("merge");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function selectFile(nextFile: File | null) {
    setError(null);
    if (!nextFile) {
      setFile(null);
      return;
    }
    if (!isSupportedCvFile(nextFile.name)) {
      setFile(null);
      setError("Choose a PDF, DOCX, TXT, or Markdown file.");
      setInputKey((current) => current + 1);
      return;
    }
    if (nextFile.size > CV_IMPORT_MAX_BYTES) {
      setFile(null);
      setError(
        `That file is ${formatFileSize(nextFile.size)}. Upload one under ${formatFileSize(
          CV_IMPORT_MAX_BYTES
        )}.`
      );
      setInputKey((current) => current + 1);
      return;
    }
    setFile(nextFile);
  }

  async function parseCv() {
    if (parsing) return;
    if (!file && pastedText.trim().length < 20) {
      setError("Choose a file or paste at least a few lines of CV text.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setParsing(true);
    setError(null);

    try {
      const body = new FormData();
      if (file) body.append("file", file);
      else body.append("text", pastedText);
      if (apiKey) body.append("apiKey", apiKey);

      const response = await fetch("/api/cv/import", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      const payload = (await response.json()) as ImportResponse;

      if (!response.ok || !payload.ok) {
        setError(
          payload.ok ? "We couldn't import that CV." : payload.error
        );
        return;
      }

      const parsed = resumeDocumentSchema.safeParse(payload.document);
      if (!parsed.success) {
        setError(
          "We couldn't map that CV safely. Try pasting the text and reviewing the sections."
        );
        return;
      }

      setResult({
        document: parsed.data,
        warnings: payload.warnings ?? [],
        mode: payload.mode ?? effectiveAiMode,
        source: payload.source ?? {
          fileName: file?.name ?? "Pasted CV text",
          characters: 0,
        },
      });
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(
        "We couldn't reach the import service. Check your connection and try again."
      );
    } finally {
      setParsing(false);
    }
  }

  function startOver() {
    setResult(null);
    setError(null);
  }

  const canParse =
    !parsing && (Boolean(file) || pastedText.trim().length >= 20);
  const mode = result?.mode ?? effectiveAiMode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Update CV from an existing file
            {mode === "mock" && <Badge variant="secondary">Demo parser</Badge>}
          </DialogTitle>
          <DialogDescription>
            Upload an old CV or paste its text. We will map what we can into the
            editor, then you can review it before anything replaces your resume.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t import that CV</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cv-file">CV file</Label>
              <Input
                key={inputKey}
                id="cv-file"
                type="file"
                accept={CV_IMPORT_ACCEPT}
                disabled={parsing}
                onChange={(event) =>
                  selectFile(event.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, TXT, or Markdown · up to{" "}
                {formatFileSize(CV_IMPORT_MAX_BYTES)}. Files are processed in
                memory and are not stored.
              </p>
              {file && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm">
                  <FileText className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => selectFile(null)}
                    aria-label="Remove selected file"
                    className="size-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
              {file && pastedText.trim().length > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  The selected file takes precedence. Clear the file to parse your pasted text instead.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                or paste text
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cv-text">CV text</Label>
              <Textarea
                id="cv-text"
                rows={7}
                maxLength={30_000}
                value={pastedText}
                onChange={(event) => {
                  setPastedText(event.target.value);
                  if (error) setError(null);
                }}
                disabled={parsing}
                placeholder="Paste your current CV here. Include headings such as Summary, Experience, Education, Skills, Projects, and Languages for the best result."
              />
              <p className="text-xs text-muted-foreground">
                {file
                  ? "The selected file will be imported instead of pasted text."
                  : `${pastedText.length.toLocaleString()} characters`}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={parsing}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void parseCv()} disabled={!canParse}>
                {parsing ? (
                  <>
                    <Spinner />
                    Reading CV…
                  </>
                ) : (
                  <>
                    <Upload data-icon="inline-start" />
                    Read CV
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">{result.source.fileName}</span>
              <span className="text-muted-foreground">
                {result.source.characters.toLocaleString()} characters read
              </span>
              <Badge variant="outline">{documentSummary(result.document).join(" · ")}</Badge>
            </div>

            {result.warnings.length > 0 && (
              <Alert>
                <AlertTitle>Review these parts</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc space-y-1 pl-4">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="max-h-[48vh] overflow-auto rounded-xl border border-border bg-neutral-100 p-3 sm:p-5">
              <ResumePreview document={result.document} templateId={templateId} />
            </div>

            <RadioGroup
              value={applyMode}
              onValueChange={(value) => {
                if (value === "merge" || value === "replace") setApplyMode(value);
              }}
              aria-label="How to apply the imported CV"
            >
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="merge" id="import-merge" className="mt-0.5" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="import-merge">Merge with this resume</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep your current values, fill empty personal fields, and add
                    imported entries. Existing rows stay.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                <RadioGroupItem value="replace" id="import-replace" className="mt-0.5" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="import-replace">Replace this resume</Label>
                  <p className="text-xs text-muted-foreground">
                    Use the imported content as the new starting point. Current
                    content will be removed from the editor.
                  </p>
                </div>
              </div>
            </RadioGroup>

            <p className="text-xs text-muted-foreground">
              {mode === "mock"
                ? "Demo parser: this import uses local section rules, not Gemini. Review every field before applying."
                : "Only the extracted text was sent to the AI provider. The original file was not stored."}{" "}
              Applying marks the editor as changed; autosave persists the
              reviewed result.
            </p>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={startOver}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => onApply(result.document, applyMode)}
                disabled={!hasImportableContent(result.document)}
              >
                Apply imported CV
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
