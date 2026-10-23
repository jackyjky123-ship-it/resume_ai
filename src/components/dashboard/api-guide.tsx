"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useApiKey } from "@/lib/api-key-context";
import { useLanguage } from "@/lib/i18n/context";
import { testApiKeyAction } from "@/server/actions/cv.actions";

type ApiGuideProps = {
  user: {
    name: string | null;
    email: string;
  };
};

export function ApiGuide({ user }: ApiGuideProps) {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey();
  const { t, isKhmer } = useLanguage();
  const [inputKey, setInputKey] = useState(apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const accountLabel = user.name?.trim() || user.email;

  const handleSave = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      clearApiKey();
      setTestResult(null);
      toast.success(t.apiGuide.keyRemovedToast);
      return;
    }
    setApiKey(trimmed);
    toast.success(t.apiGuide.keySavedToast);
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim() || apiKey?.trim();
    if (!keyToTest) {
      toast.error(t.apiGuide.enterKeyError);
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await testApiKeyAction(keyToTest);
      if (res.ok) {
        setTestResult({
          success: true,
          message: t.apiGuide.testPassed.replace("{model}", res.data.model),
        });
        toast.success(t.apiGuide.testPassedToast);
        // Auto save verified key
        setApiKey(keyToTest);
      } else {
        setTestResult({
          success: false,
          message: res.error,
        });
        toast.error(res.error);
      }
    } catch {
      setTestResult({
        success: false,
        message: t.apiGuide.networkError,
      });
      toast.error(t.apiGuide.connectionFailedToast);
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = () => {
    setInputKey("");
    clearApiKey();
    setTestResult(null);
    toast.success(t.apiGuide.keyRemovedToast);
  };

  return (
    <div className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-hairline pb-6">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.apiGuide.title}
          </h1>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-800/60">
            {t.apiGuide.byokBadge}
          </span>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {t.apiGuide.description.replace("{accountLabel}", accountLabel)}
        </p>
      </div>

      {/* Status Bar */}
      <div className="rounded-2xl border border-hairline bg-card p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`grid size-11 place-items-center rounded-xl ${
              hasKey
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            }`}
          >
            <KeyRound className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                {t.apiGuide.connectionStatus}
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  hasKey
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                    : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                }`}
              >
                {hasKey ? (
                  <>
                    <CheckCircle2 className="size-3" />
                    {t.apiGuide.statusActive}
                  </>
                ) : (
                  t.apiGuide.statusNotConfigured
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasKey
                ? t.apiGuide.statusActiveDesc
                : t.apiGuide.statusNotConfiguredDesc}
            </p>
          </div>
        </div>

        {hasKey && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60 cursor-pointer self-start sm:self-center gap-1.5"
          >
            <Trash2 className="size-3.5" />
            {t.apiGuide.removeKey}
          </Button>
        )}
      </div>

      {/* Step-by-Step Interactive Guide */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t.apiGuide.stepsKicker}
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-hairline bg-card p-5 shadow-2xs space-y-3">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-display">
              1
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              {t.apiGuide.step1Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.apiGuide.step1Desc}
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-stone-50 dark:bg-muted/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-stone-100 dark:hover:bg-muted/70 transition-colors"
            >
              {t.apiGuide.step1Button}
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-hairline bg-card p-5 shadow-2xs space-y-3">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-display">
              2
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              {t.apiGuide.step2Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.apiGuide.step2Desc}
            </p>
            <div className="rounded-lg bg-stone-50 dark:bg-muted/40 p-2 font-mono text-[11px] text-muted-foreground border border-hairline/60">
              {t.apiGuide.step2Format}
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-hairline bg-card p-5 shadow-2xs space-y-3">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-display">
              3
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              {t.apiGuide.step3Title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.apiGuide.step3Desc}
            </p>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3.5" />
              {t.apiGuide.step3BrowserStorage}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Input & Verification Box */}
      <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm space-y-5 ring-1 ring-primary/10">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4.5 text-primary" />
            {t.apiGuide.inputBoxTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t.apiGuide.inputBoxDesc}
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder={t.apiGuide.inputPlaceholder}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="font-mono text-xs sm:text-sm pr-10 bg-background h-11 border-hairline focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Live Test Result Banner */}
        {testResult && (
          <div
            className={`rounded-xl p-3.5 text-xs flex items-start gap-2.5 border ${
              testResult.success
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-semibold">
                {testResult.success
                  ? isKhmer ? "ជោគជ័យ" : "Success"
                  : isKhmer ? "កំហុសការតភ្ជាប់" : "Connection Error"}
              </p>
              <p>{testResult.message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={testing || (!inputKey.trim() && !apiKey)}
              onClick={handleTestConnection}
              className="cursor-pointer gap-2 h-9"
            >
              {testing ? <Spinner className="size-3.5" /> : <Zap className="size-3.5 text-amber-500" />}
              {testing ? t.apiGuide.testingBtn : t.apiGuide.testConnectionBtn}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer h-9 px-5 rounded-lg active:scale-95 transition-all"
            >
              {t.apiGuide.saveKeyBtn}
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy & FAQs */}
      <div className="rounded-2xl border border-hairline bg-card p-6 space-y-4">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          {t.apiGuide.faqTitle}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{t.apiGuide.faq1Q}</h4>
            <p className="leading-relaxed">
              {t.apiGuide.faq1A}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{t.apiGuide.faq2Q}</h4>
            <p className="leading-relaxed">
              {t.apiGuide.faq2A}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{t.apiGuide.faq3Q}</h4>
            <p className="leading-relaxed">
              {t.apiGuide.faq3A}
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{t.apiGuide.faq4Q}</h4>
            <p className="leading-relaxed">
              {t.apiGuide.faq4A}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
