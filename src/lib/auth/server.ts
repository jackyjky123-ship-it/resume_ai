// Neon Auth (Managed Better Auth) — server instance for Route Handlers,
// Server Actions, and proxy/`auth.middleware`.
import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
