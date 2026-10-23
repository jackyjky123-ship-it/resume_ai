import { Suspense } from "react";
import { requireUser } from "@/lib/auth/current-user";
import { TemplatesGallery } from "@/components/dashboard/templates-gallery";

async function TemplatesPageWithSession() {
  const user = await requireUser();
  return <TemplatesGallery user={{ name: user.name, email: user.email }} />;
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full space-y-8 animate-pulse">
          <div className="space-y-2">
            <span className="block h-8 w-64 rounded-xl bg-hairline/60" />
            <span className="block h-4 w-96 rounded-lg bg-hairline/40" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="block h-80 rounded-2xl border border-hairline bg-white/60" />
            ))}
          </div>
        </div>
      }
    >
      <TemplatesPageWithSession />
    </Suspense>
  );
}
