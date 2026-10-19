// Route protection via Next.js 16 Proxy (formerly middleware).
// Optimistic check only — verify the session server-side in pages/routes too.
import { auth } from "@/lib/auth/server";

export default auth.middleware({ loginUrl: "/login" });

export const config = {
  matcher: ["/dashboard/:path*", "/resumes/:path*"],
};
