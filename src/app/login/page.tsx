"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Sparkles, User } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Wordmark } from "@/components/wordmark";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
        setError(result.error.message ?? "Request failed");
        return;
      }
      // Server components re-render with the fresh session cookie on navigation.
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-[#faf8f5] px-6 py-12 text-[#102422]">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[450px] w-full max-w-4xl -translate-x-1/2 opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, #004643 0%, #dda15e 40%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-md">
        {/* Header with Wordmark */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block transition hover:opacity-90">
            <Wordmark />
          </Link>
          <p className="mt-2 text-xs font-medium uppercase tracking-widest text-[#004643]">
            Intelligent Career Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-[#e2ded5] bg-white p-8 shadow-xl shadow-[#004643]/5">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-full border border-[#e2ded5] bg-[#f0ede5]/60 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                mode === "signin"
                  ? "bg-[#004643] text-[#f0ede5] shadow-xs"
                  : "text-[#586e6b] hover:text-[#102422]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
                mode === "signup"
                  ? "bg-[#004643] text-[#f0ede5] shadow-xs"
                  : "text-[#586e6b] hover:text-[#102422]"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#102422]">
              {mode === "signin" ? "Welcome back" : "Get started with Niseth Code"}
            </h1>
            <p className="mt-1 text-xs text-[#586e6b]">
              {mode === "signin"
                ? "Enter your credentials to access your saved resumes."
                : "Create your free account to build and export watermark-free resumes."}
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-[#102422]">
                  Full Name (optional)
                </label>
                <div className="relative mt-1">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586e6b]"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amara Chen"
                    className="w-full rounded-xl border border-[#e2ded5] bg-[#faf8f5] py-2.5 pl-10 pr-4 text-sm text-[#102422] placeholder:text-[#586e6b]/60 focus:border-[#004643] focus:bg-white focus:outline-none"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#102422]">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586e6b]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-[#e2ded5] bg-[#faf8f5] py-2.5 pl-10 pr-4 text-sm text-[#102422] placeholder:text-[#586e6b]/60 focus:border-[#004643] focus:bg-white focus:outline-none"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#102422]">
                Password
              </label>
              <div className="relative mt-1">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#586e6b]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#e2ded5] bg-[#faf8f5] py-2.5 pl-10 pr-4 text-sm text-[#102422] placeholder:text-[#586e6b]/60 focus:border-[#004643] focus:bg-white focus:outline-none"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#004643] py-3 text-sm font-semibold text-[#f0ede5] shadow-md transition hover:bg-[#003330] hover:shadow-lg disabled:opacity-60"
            >
              {pending ? (
                "Processing…"
              ) : mode === "signin" ? (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              ) : (
                <>
                  Create Account
                  <Sparkles size={15} />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Guarantee note */}
          <div className="mt-6 border-t border-[#e2ded5] pt-4">
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#586e6b]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#004643]" />
                Encrypted Session
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#004643]" />
                Zero Watermark
              </span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-xs text-[#586e6b]">
          <Link href="/" className="font-semibold text-[#004643] hover:underline">
            ← Return to Niseth Code Homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
