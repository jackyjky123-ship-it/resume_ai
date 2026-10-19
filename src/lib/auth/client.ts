// Neon Auth browser client — no arguments; talks to the same-origin proxy
// at /api/auth/* (handled by app/api/auth/[...path]/route.ts).
import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
