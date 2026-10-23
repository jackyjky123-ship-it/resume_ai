"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useLanguage } from "@/lib/i18n/context";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="rounded-full border border-hairline bg-white px-4 py-2 text-sm font-semibold text-graphite shadow-2xs transition-all duration-150 hover:border-[#004643]/40 hover:bg-[#f0ede5]/40 hover:text-[#004643] active:scale-95 cursor-pointer"
      onClick={async () => {
        await authClient.signOut();
        // Server components re-render without the session after this navigation.
        router.push("/");
      }}
    >
      {t.nav.signOut}
    </button>
  );
}
