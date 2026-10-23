import { Suspense, type ReactNode } from "react";
import { ApiKeyProvider } from "@/lib/api-key-context";
import { requireUser } from "@/lib/auth/current-user";
import {
  DashboardSidebar,
  DashboardSidebarSkeleton,
} from "@/components/dashboard/dashboard-sidebar";

async function SidebarWithSession() {
  const user = await requireUser();
  return <DashboardSidebar user={{ name: user.name, email: user.email }} />;
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ApiKeyProvider>
      <div className="flex min-h-dvh flex-col lg:flex-row bg-background">
        <Suspense fallback={<DashboardSidebarSkeleton />}>
          <SidebarWithSession />
        </Suspense>
        <main className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>
    </ApiKeyProvider>
  );
}
