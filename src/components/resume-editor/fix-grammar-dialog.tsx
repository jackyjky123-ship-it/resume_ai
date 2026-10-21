"use client";

import { useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
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
  const { apiKey } = useApiKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    original: string;
    corrected: string;
    explanation: string;
    mode: AiMode;
  } | null>(null);

  async function handleFix() {
    if (!text.trim() || text.trim().length < 3) {
      setError("Please write some text before fixing grammar.");
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
      setError("Could not reach the proofreading service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (!result) return;
    onApply(result.corrected);
    toast.success(`${label} updated. Autosave will save it.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Proofread with AI
            {result?.mode && (
              <Badge variant="secondary">
                {result.mode === "gemini" ? "Gemini" : "Demo AI"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Polish grammar, punctuation, and phrasing while preserving your exact meaning.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t proofread</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current text:
              </p>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {text.trim() || "No text entered yet."}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleFix()}
                disabled={loading || text.trim().length < 3}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Checking…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Proofread text
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
                  Original
                </p>
                <p className="text-sm whitespace-pre-wrap">{result.original}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-primary">
                  Suggested
                </p>
                <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
                  {result.corrected}
                </p>
              </div>
            </div>

            {result.explanation && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Changes:</span>{" "}
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
                Keep original
              </Button>
              <Button type="button" onClick={handleAccept}>
                <Check />
                Use suggested text
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
