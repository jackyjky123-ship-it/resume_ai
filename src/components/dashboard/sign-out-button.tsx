"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-semibold text-graphite transition hover:border-[#004643]/40 hover:text-[#004643]"
      onClick={async () => {
        await authClient.signOut();
        // Server components re-render without the session after this navigation.
        router.push("/");
      }}
    >
      Sign out
    </button>
  );
}
