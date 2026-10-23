import { Suspense } from "react";
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
    <div suppressHydrationWarning className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-6">
        <div className="space-y-2">
          <span className="block h-8 w-60 rounded-xl bg-hairline/60" />
          <span className="block h-4 w-96 rounded-lg bg-hairline/40" />
        </div>
        <span className="block h-10 w-36 rounded-xl bg-hairline/60" />
      </div>

      <div className="rounded-xl border border-hairline bg-card/60 h-28 divide-x divide-hairline hidden sm:grid sm:grid-cols-4" />
      <div className="sm:hidden grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((key) => (
          <span key={key} className="block h-24 rounded-xl border border-hairline bg-card/60" />
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <span className="block h-6 w-40 rounded-lg bg-hairline/60" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <span key={key} className="block h-[236px] rounded-2xl border border-hairline bg-card/60" />
          ))}
        </div>
      </div>
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
