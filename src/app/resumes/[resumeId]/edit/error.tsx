"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the console report short — never log resume content.
    console.error("[editor]", error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold">The editor didn’t load.</h1>
      <p className="mt-2 text-sm text-graphite">
        Nothing was lost — your last save is still stored. Retry, or return to the dashboard.
      </p>
      <div className="mt-6 flex gap-2">
        <Button type="button" onClick={reset}>
          <RotateCcw data-icon="inline-start" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard" prefetch={false}>
            Back to dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}
