"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/lib/api-key-context";
import { isValidKeyFormat } from "@/lib/api-key-store";

type ApiKeySettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApiKeySettingsDialog({
  open,
  onOpenChange,
}: ApiKeySettingsDialogProps) {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Masked display of stored key
  const maskedKey = apiKey
    ? `${apiKey.slice(0, 6)}••••••••••••••••${apiKey.slice(-4)}`
    : null;

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError("Please enter your Gemini API key.");
      return;
    }

    if (!isValidKeyFormat(trimmed)) {
      setError(
        "That key format doesn't look like a standard Google AI Studio key (starts with 'AIza...'). Please verify and try again."
      );
      return;
    }

    setApiKey(trimmed);
    setInputValue("");
    setError(null);
    toast.success("Gemini API key saved in your browser!");
    onOpenChange(false);
  };

  const handleRemove = () => {
    clearApiKey();
    setInputValue("");
    setError(null);
    toast.info("API key removed. AI features will use demo mock mode.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Gemini API Key (BYOK)</DialogTitle>
              <DialogDescription className="text-xs">
                Bring your own free Google AI Studio key to power all AI resume features.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasKey ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>API Key Configured</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Active
                </Badge>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {maskedKey}
              </p>
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Remove Key
                </Button>
              </div>
            </div>
          ) : (
            <Alert className="border-amber-500/30 bg-amber-500/5 py-2.5">
              <AlertTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Demo Mode Active
              </AlertTitle>
              <AlertDescription className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Without a key, the editor uses local mock heuristics for suggestions and grammar checking. Add your key below to unlock real Gemini AI generation.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="gemini-api-key" className="text-xs font-medium">
              {hasKey ? "Replace API Key" : "Enter Gemini API Key"}
            </Label>
            <div className="relative">
              <Input
                id="gemini-api-key"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError(null);
                }}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">How to get a free API key</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-[11px]"
              >
                Google AI Studio
                <ExternalLink className="size-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
              <li>Open Google AI Studio and sign in with your Google account.</li>
              <li>Click &ldquo;Create API key&rdquo; (free tier has generous daily limits).</li>
              <li>Copy and paste your key above.</li>
            </ol>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Privacy Guaranteed</p>
              <p>
                Your API key is saved only in your browser&apos;s localStorage. It is sent transiently per AI request directly to Gemini and is never stored in any database or logged on our servers.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!inputValue.trim()}
          >
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
