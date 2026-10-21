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
import type { ResumeBullet } from "@/lib/validations/resume";
import { useApiKey } from "@/lib/api-key-context";
import { improveBulletAction } from "@/server/actions/cv.actions";

type ImproveBulletDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bullets: ResumeBullet[];
  role?: string;
  company?: string;
  onApply: (bulletId: string, improvedText: string) => void;
};

export function ImproveBulletDialog({
  open,
  onOpenChange,
  bullets,
  role = "",
  company = "",
  onApply,
}: ImproveBulletDialogProps) {
  const { apiKey } = useApiKey();
  const eligibleBullets = bullets.filter((b) => b.text.trim().length >= 3);
  const [selectedId, setSelectedId] = useState<string>(
    () => eligibleBullets[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    original: string;
    improved: string;
    explanation: string;
    mode: AiMode;
    bulletId: string;
  } | null>(null);

  const currentSelected =
    bullets.find((b) => b.id === (result?.bulletId ?? selectedId)) ??
    eligibleBullets[0];

  async function handleImprove() {
    if (!currentSelected || !currentSelected.text.trim()) {
      setError("Please select a bullet point to improve.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await improveBulletAction({
        apiKey: apiKey ?? undefined,
        bullet: currentSelected.text,
        role,
        company,
      });

      if (!response.ok) {
        setError(response.error);
        return;
      }

      setResult({
        original: currentSelected.text,
        improved: response.data.improvedBullet,
        explanation: response.data.explanation,
        mode: response.data.mode,
        bulletId: currentSelected.id,
      });
    } catch {
      setError("Could not connect to the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (!result) return;
    onApply(result.bulletId, result.improved);
    toast.success("Bullet point updated. Autosave will save it.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Improve bullet with AI
            {result?.mode && (
              <Badge variant="secondary">
                {result.mode === "gemini" ? "Gemini" : "Demo AI"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Reframe your bullet to highlight action and results without inventing facts or metrics.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t improve bullet</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!result ? (
          <div className="flex flex-col gap-4">
            {eligibleBullets.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Write a bullet point in the editor first, then click improve.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Select a bullet to improve:
                </label>
                <div className="flex flex-col gap-2">
                  {eligibleBullets.map((bullet) => (
                    <button
                      key={bullet.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(bullet.id);
                        setError(null);
                      }}
                      className={`rounded-lg border p-3 text-left text-sm transition ${
                        selectedId === bullet.id
                          ? "border-primary bg-primary/5 font-medium text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      • {bullet.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                onClick={() => void handleImprove()}
                disabled={loading || eligibleBullets.length === 0}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Improving…
                  </>
                ) : (
                  <>
                    <Sparkles />
                    Improve bullet
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
                  Improved
                </p>
                <p className="text-sm font-medium whitespace-pre-wrap text-foreground">
                  {result.improved}
                </p>
              </div>
            </div>

            {result.explanation && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Why:</span>{" "}
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
                Use improved bullet
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
