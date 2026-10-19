"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

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
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-hairline bg-white p-8">
        <h1 className="font-display text-2xl font-bold">
          {mode === "signin" ? "Sign in to ResumeAI" : "Create your ResumeAI account"}
        </h1>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {mode === "signup" && (
            <label className="text-sm font-medium">
              Name (optional)
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-hairline px-3 py-2"
                autoComplete="name"
              />
            </label>
          )}
          <label className="text-sm font-medium">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-hairline px-3 py-2"
              autoComplete="email"
            />
          </label>
          <label className="text-sm font-medium">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border border-hairline px-3 py-2"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-action px-6 py-3 text-[15px] font-semibold text-white hover:bg-action-strong disabled:opacity-60"
          >
            {pending ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-graphite">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="font-semibold underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}
