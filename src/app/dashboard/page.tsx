import { Suspense } from "react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { auth } from "@/lib/auth/server";

async function SessionBadge() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return <p className="text-sm text-graphite">Signed out.</p>;
  }

  return (
    <p className="text-sm text-graphite">
      Signed in as <span className="font-semibold text-foreground">{session.user.email}</span>
    </p>
  );
}

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>

      {/* Reading the session hits cookies() — stream behind a boundary (Cache Components) */}
      <div className="mt-6 rounded-2xl border border-hairline bg-white p-6">
        <Suspense fallback={<p className="text-sm text-graphite">Loading session…</p>}>
          <SessionBadge />
        </Suspense>
        <div className="mt-4">
          <SignOutButton />
        </div>
      </div>

      <p className="mt-6 text-sm text-graphite">
        Resume CRUD arrives with the editor phase — this page proves Neon Auth sessions work
        end to end.
      </p>
    </main>
  );
}
