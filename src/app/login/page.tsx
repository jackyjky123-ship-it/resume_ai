"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/lib/i18n/context";

type Mode = "signin" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isKhmer } = useLanguage();

  const queryEmail = searchParams.get("email") ?? "";
  const queryName = searchParams.get("name") ?? "";
  const queryMode = searchParams.get("mode");
  const initialMode: Mode =
    queryMode === "signup" || queryName || queryEmail ? "signup" : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState(queryName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({ email, password, name: name || email })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? t.auth.invalidCredentials);
        return;
      }
      // Server components re-render with the fresh session cookie on navigation.
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.invalidCredentials);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-hairline bg-card p-8 shadow-xl shadow-primary/5">
      {/* Mode Switcher Tabs */}
      <div className="flex rounded-full border border-hairline bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition cursor-pointer ${
            mode === "signin"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.auth.signInTab}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`flex-1 rounded-full py-2 text-xs font-bold transition cursor-pointer ${
            mode === "signup"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.auth.signUpTab}
        </button>
      </div>

      <div className="mt-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? t.auth.welcomeBack : t.auth.getStarted}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "signin" ? t.auth.signInDesc : t.auth.signUpDesc}
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-foreground">
              {t.auth.nameLabel} {`(${t.common.optional})`}
            </label>
            <div className="relative mt-1">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.namePlaceholder}
                className="w-full rounded-xl border border-hairline bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:outline-none"
                autoComplete="name"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-foreground">
            {t.auth.emailLabel}
          </label>
          <div className="relative mt-1">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t.auth.emailPlaceholder}
              className="w-full rounded-xl border border-hairline bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:outline-none"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground">
            {t.auth.passwordLabel}
          </label>
          <div className="relative mt-1">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder={t.auth.passwordPlaceholder}
              className="w-full rounded-xl border border-hairline bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:outline-none"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:shadow-lg disabled:opacity-60 cursor-pointer"
        >
          {pending ? (
            mode === "signin" ? t.auth.signingIn : t.auth.creatingAccount
          ) : mode === "signin" ? (
            <>
              {t.auth.signInButton}
              <ArrowRight size={15} />
            </>
          ) : (
            <>
              {t.auth.signUpButton}
              <Sparkles size={15} />
            </>
          )}
        </button>
      </form>

      {/* Privacy & Guarantee note */}
      <div className="mt-6 border-t border-hairline pt-4">
        <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-primary" />
            {isKhmer ? "សុវត្ថិភាពខ្ពស់" : "Encrypted Session"}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-primary" />
            {isKhmer ? "គ្មាន Watermark" : "Zero Watermark"}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="rounded-3xl border border-hairline bg-card p-8 shadow-xl shadow-primary/5">
      <div className="h-10 w-full animate-pulse rounded-full bg-muted/60" />
      <div className="mt-6 space-y-2">
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="mt-6 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-xl bg-background" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-background" />
        <div className="h-11 w-full animate-pulse rounded-full bg-primary/30" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-background px-6 py-12 text-foreground transition-colors duration-200">
      {/* Top action row with language and theme switch */}
      <header className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <LanguageToggle compact />
        <ThemeToggle compact />
      </header>

      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[450px] w-full max-w-4xl -translate-x-1/2 opacity-30 blur-3xl dark:opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--primary) 0%, #dda15e 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-md">
        {/* Header with Wordmark */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block transition hover:opacity-90">
            <Wordmark />
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-primary">
            {t.landing.badge}
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        {/* Back link */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="font-semibold text-primary hover:underline">
            ← {t.auth.backToHome}
          </Link>
        </p>
      </div>
    </div>
  );
}
