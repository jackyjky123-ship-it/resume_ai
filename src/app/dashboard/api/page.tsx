import { Suspense } from "react";
import { requireUser } from "@/lib/auth/current-user";
import { ApiGuide } from "@/components/dashboard/api-guide";

async function ApiPageWithSession() {
  const user = await requireUser();
  return <ApiGuide user={{ name: user.name, email: user.email }} />;
}

export default function ApiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
          <div className="space-y-2">
            <span className="block h-8 w-64 rounded-xl bg-hairline/60" />
            <span className="block h-4 w-96 rounded-lg bg-hairline/40" />
          </div>
          <div className="space-y-4">
            <span className="block h-40 rounded-2xl border border-hairline bg-white/60" />
            <span className="block h-60 rounded-2xl border border-hairline bg-white/60" />
          </div>
        </div>
      }
    >
      <ApiPageWithSession />
    </Suspense>
  );
}
