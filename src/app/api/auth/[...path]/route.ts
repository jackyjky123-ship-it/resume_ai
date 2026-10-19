// Neon Auth catch-all Route Handler — forwards all auth requests
// (/api/auth/*) to the Managed Better Auth server.
import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
