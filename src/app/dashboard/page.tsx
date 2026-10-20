import { Suspense } from "react";
import { Wordmark } from "@/components/wordmark";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { requireUser } from "@/lib/auth/current-user";
import { listResumeCards } from "@/server/services/resume.service";

async function WorkspaceWithSession() {
  const user = await requireUser();
  const resumes = await listResumeCards(user.id);

  return (
    <DashboardWorkspace
      user={{ name: user.name, email: user.email }}
      resumes={resumes}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div suppressHydrationWarning className="flex min-h-dvh flex-col">
      <header className="border-b border-hairline bg-white/85">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
          <Wordmark />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20 pt-8 sm:pt-10">
        <div className="flex animate-pulse items-center gap-6">
          <span className="size-20 shrink-0 rounded-full bg-hairline/60 sm:size-24" />
          <div className="flex-1 space-y-3">
            <span className="block h-7 w-52 rounded-full bg-hairline/60" />
            <span className="block h-4 w-40 rounded-full bg-hairline/40" />
            <span className="block h-4 w-64 rounded-full bg-hairline/40" />
          </div>
        </div>
        <div className="mt-8 grid gap-5 border-t border-hairline pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <span key={key} className="block h-[236px] rounded-2xl border border-hairline bg-white/60" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  // Reading the session hits cookies() — stream behind a boundary (Cache Components)
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <WorkspaceWithSession />
    </Suspense>
  );
}
