"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Palette,
  Settings,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { isValidKeyFormat } from "@/lib/api-key-store";
import { useApiKey } from "@/lib/api-key-context";
import { authClient } from "@/lib/auth/client";
import { useLanguage } from "@/lib/i18n/context";
import { testApiKeyAction } from "@/server/actions/cv.actions";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name: string | null; email: string };
};

/**
 * Rendered inside DialogContent, which unmounts when the dialog closes. Keeping
 * the draft key here means every open starts from the saved key instead of a
 * cancelled edit.
 */
function ApiKeyPanel() {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey();
  const { t } = useLanguage();
  const [inputKey, setInputKey] = useState(apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      toast.error(t.apiGuide.enterKeyError);
      return;
    }
    if (!isValidKeyFormat(trimmed)) {
      toast.error(t.apiGuide.invalidKeyError);
      return;
    }
    setApiKey(trimmed);
    toast.success(t.apiGuide.keySavedToast);
  };

  const handleTestKey = async () => {
    const keyToTest = inputKey.trim() || apiKey?.trim();
    if (!keyToTest) {
      toast.error(t.apiGuide.enterKeyError);
      return;
    }
    if (!isValidKeyFormat(keyToTest)) {
      setTestStatus({
        success: false,
        message: t.apiGuide.invalidKeyError,
      });
      toast.error(t.apiGuide.invalidKeyError);
      return;
    }

    setTesting(true);
    setTestStatus(null);
    try {
      const res = await testApiKeyAction(keyToTest);
      if (res.ok) {
        setTestStatus({
          success: true,
          message: t.apiGuide.testPassed.replace("{model}", res.data.model),
        });
        toast.success(t.apiGuide.testPassedToast);
        // Auto-save verified key
        setApiKey(keyToTest);
      } else {
        setTestStatus({
          success: false,
          message: res.error,
        });
        toast.error(res.error);
      }
    } catch {
      setTestStatus({
        success: false,
        message: t.apiGuide.networkError,
      });
      toast.error(t.apiGuide.connectionFailedToast);
    } finally {
      setTesting(false);
    }
  };

  const handleClearKey = () => {
    setInputKey("");
    clearApiKey();
    setTestStatus(null);
    toast.success(t.apiGuide.keyRemovedToast);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-hairline bg-stone-50/70 dark:bg-muted/40 p-4 text-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs tracking-wider uppercase">
            <Sparkles className="size-3.5 text-primary" />
            {t.settings.byokTitle}
          </span>
          {hasKey ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="size-3" />
              {t.settings.byokActive}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {t.settings.byokDemo}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t.settings.byokDesc}
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
        >
          {t.settings.getKeyLink}
          <ExternalLink className="size-3" />
        </a>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="settings-api-key-input"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          {t.settings.apiKeyLabel}
        </label>
        <div className="relative">
          <Input
            id="settings-api-key-input"
            type={showKey ? "text" : "password"}
            placeholder="AQ.Ab... or AIzaSy..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="font-mono text-xs pr-10 bg-background"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {testStatus && (
        <div
          className={`rounded-lg p-3 text-xs flex items-start gap-2 border ${
            testStatus.success
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
              : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/60"
          }`}
        >
          {testStatus.success ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          ) : (
            <XCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          )}
          <span>{testStatus.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hairline">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={testing}
            onClick={handleTestKey}
            className="cursor-pointer"
          >
            {testing ? <Spinner className="size-3.5 mr-1.5" /> : null}
            {testing ? t.apiGuide.testingBtn : t.settings.testBtn}
          </Button>
          {hasKey && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearKey}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              {t.settings.removeKeyBtn}
            </Button>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleSaveKey}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {t.settings.saveKeyBtn}
        </Button>
      </div>
    </div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  const router = useRouter();
  const { hasKey } = useApiKey();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"api" | "profile">("api");

  const displayName = user.name?.trim() || user.email.split("@")[0] || "User";

  const handleSignOut = async () => {
    onOpenChange(false);
    await authClient.signOut();
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl bg-card border border-border/70 shadow-xl">
        <div className="flex border-b border-hairline bg-stone-50/80 dark:bg-card/90 px-6 py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Settings className="size-4 text-primary" />
              </span>
              {t.settings.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t.settings.desc}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-hairline px-6 bg-card gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "api"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound className="size-4" />
            {t.settings.tabApi}
            {hasKey && (
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-4" />
            {t.settings.tabProfile}
          </button>
        </div>

        <div className="p-6 bg-card">
          {activeTab === "api" && <ApiKeyPanel />}

          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl border border-hairline bg-stone-50/70 dark:bg-muted/40 p-4">
                <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-lg font-display">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Palette className="size-3.5 text-primary" />
                  {t.settings.themeLabel}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-hairline bg-stone-50/70 dark:bg-muted/40 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.settings.colorScheme}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.colorSchemeDesc}
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.settings.aboutTitle}
                </h4>
                <div className="rounded-lg border border-hairline p-3 text-xs text-muted-foreground space-y-1 bg-stone-50/40 dark:bg-card/40">
                  <p className="text-foreground font-medium">{t.settings.aboutSub}</p>
                  <p>{t.settings.aboutDesc}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-hairline flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60 cursor-pointer gap-2"
                >
                  <LogOut className="size-4" />
                  {t.settings.signOut}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
