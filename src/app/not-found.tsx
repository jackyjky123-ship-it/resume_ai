import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Wordmark />
      <h1 className="mt-6 font-display text-2xl font-bold">We couldn’t find that page.</h1>
      <p className="mt-2 text-sm text-graphite">
        The link may be out of date, or the resume was deleted.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          href="/dashboard"
          prefetch={false}
          className="rounded-full bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-strong"
        >
          Back to dashboard
        </Link>
        <Link
          href="/"
          className="rounded-full border border-hairline bg-white px-5 py-2.5 text-sm font-semibold hover:border-foreground/40"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
