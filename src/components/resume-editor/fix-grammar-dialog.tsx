"use client";

import { useState } from "react";
import { Check, KeyRound, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

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
import { Spinner } from "@/components/ui/spinner";
import type { AiMode } from "@/lib/validations/ai";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import { fixGrammarAction } from "@/server/actions/cv.actions";

type FixGrammarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  label?: string;
  onApply: (correctedText: string) => void;
};

export function FixGrammarDialog({
  open,
  onOpenChange,
  text,
  label = "Professional summary",
  onApply,
}: FixGrammarDialogProps) {
  const { apiKey, hasKey, openKeySettings, promptApiKey } = useApiKey();
  const { t, isKhmer } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    original: string;
    corrected: string;
    explanation: string;
    mode: AiMode;
  } | null>(null);

  async function handleFix() {
    if (!hasKey) {
      promptApiKey?.(isKhmer ? "ការត្រួតពិនិត្យវេយ្យាករណ៍" : "Grammar proofreading");
      return;
    }

    if (!text.trim() || text.trim().length < 3) {
      setError(
        isKhmer
          ? "សូមសរសេរអត្ថបទមួយចំនួនជាមុនសិន មុនពេលកែវេយ្យាករណ៍។"
          : "Please write some text before fixing grammar."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fixGrammarAction({
        apiKey: apiKey ?? undefined,
        text,
      });

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setResult({
        original: text,
        corrected: response.data.correctedText,
        explanation: response.data.explanation,
        mode: response.data.mode,
      });
    } catch {
      setError(
        isKhmer
          ? "មិនអាចទាក់ទងសេវាកម្មត្រួតពិនិត្យបានទេ។ សូមព្យាយាមម្តងទៀត។"
          : "Could not reach the proofreading service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (!result) return;
    onApply(result.corrected);
    toast.success(
      isKhmer
        ? `បានកែសម្រួល ${label} រួចរាល់។ ប្រព័ន្ធនឹងរក្សាទុកដោយស្វ័យប្រវត្តិ។`
        : `${label} updated. Autosave will save it.`
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {t.aiDialogs.grammarTitle}
            {result?.mode && (
              <Badge variant="secondary">
                {result.mode === "gemini" ? "Gemini" : "Demo AI"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {t.aiDialogs.grammarDesc}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{isKhmer ? "មានបញ្ហាក្នុងការពិនិត្យ" : "Couldn't proofread"}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="flex flex-col gap-4">
            {!hasKey && (
              <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                <KeyRound className="size-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
                  {isKhmer ? "តម្រូវឱ្យមាន Gemini API Key" : "Gemini API Key Required"}
                </AlertTitle>
                <AlertDescription className="mt-1 flex flex-col gap-2.5 text-xs">
                  <span>
                    {isKhmer
                      ? "ដើម្បីពិនិត្យ និងកែវេយ្យាករណ៍ជាមួយ Gemini AI អ្នកត្រូវបញ្ចូល API Key ឥតគិតថ្លៃរបស់អ្នកជាមុនសិន។"
                      : "To proofread text with Gemini AI, you must configure your free Google AI Studio API key."}
                  </span>
                  <div>
                    <Button
                      type="button"
                      size="xs"
                      onClick={() => openKeySettings?.()}
                      className="gap-1.5 font-medium shadow-xs"
                    >
                      <KeyRound className="size-3" />
                      {isKhmer ? "បញ្ចូល API Key ឥឡូវនេះ" : "Add API Key Now"}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {isKhmer ? "អត្ថបទបច្ចុប្បន្ន៖" : "Current text:"}
              </p>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {text.trim() || (isKhmer ? "មិនទាន់មានអត្ថបទនៅឡើយទេ។" : "No text entered yet.")}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!hasKey) {
                    promptApiKey?.(isKhmer ? "ការត្រួតពិនិត្យវេយ្យាករណ៍" : "Grammar proofreading");
                    return;
                  }
                  void handleFix();
                }}
                disabled={loading || text.trim().length < 3}
              >
                {loading ? (
                  <>
                    <Spinner />
                    {t.aiDialogs.improving}
                  </>
                ) : !hasKey ? (
                  <>
                    <KeyRound />
                    {isKhmer ? "តម្រូវឱ្យមាន API Key" : "API Key Required"}
                  </>
                ) : (
                  <>
                    <Sparkles />
                    {t.aiDialogs.fixGrammarBtn}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.aiDialogs.current}
                </p>
                <p className="text-sm whitespace-pre-wrap">{result.original}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                  {t.aiDialogs.suggested}
                </p>
                <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
                  {result.corrected}
                </p>
              </div>
            </div>

            {result.explanation && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {isKhmer ? "ការកែសម្រួល៖" : "Changes:"}
                </span>{" "}
                {result.explanation}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResult(null)}
              >
                <X />
                {t.aiDialogs.skip}
              </Button>
              <Button type="button" onClick={handleAccept}>
                <Check />
                {t.aiDialogs.applyFix}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
