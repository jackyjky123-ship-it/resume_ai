import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ResumeEditor } from "@/components/resume-editor/resume-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Wordmark } from "@/components/wordmark";
import { requireUser } from "@/lib/auth/current-user";
import { getAiMode } from "@/server/services/ai.service";
import { getResumeForEditor } from "@/server/services/resume.service";

async function EditorWithSession({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = await params;
  const user = await requireUser();
  const resume = await getResumeForEditor(user.id, resumeId);

  if (!resume) notFound();

  return <ResumeEditor resume={resume} aiMode={getAiMode()} />;
}

function EditorSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-hairline bg-white/90">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <Wordmark />
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1500px] items-start gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,46%)]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-9 w-full max-w-xl rounded-full" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="mx-auto h-[800px] w-full max-w-[794px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function EditResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  // `params` is runtime data: read it inside the Suspense boundary so the
  // static shell can prerender (Cache Components).
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorWithSession params={params} />
    </Suspense>
  );
}
