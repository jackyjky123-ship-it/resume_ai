import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "./server";

export type AppUser = {
  id: string;
  authUserId: string;
  email: string;
  name: string | null;
};

/**
 * Resolve the Neon Auth session to the app's `User` row.
 *
 * The Better Auth user id is the only identity we trust; the app row is
 * created lazily on first authenticated request so resumes always have an
 * owner. React `cache` dedupes the lookup within a single request.
 */
export const getSessionUser = cache(async (): Promise<AppUser | null> => {
  const { data: session } = await auth.getSession();
  const authUser = session?.user;

  if (!authUser?.id || !authUser.email) return null;

  const name = authUser.name?.trim() || null;

  return prisma.user.upsert({
    where: { authUserId: authUser.id },
    update: { email: authUser.email, name },
    create: {
      authUserId: authUser.id,
      email: authUser.email,
      name,
    },
    select: {
      id: true,
      authUserId: true,
      email: true,
      name: true,
    },
  });
});

/** Page/DAL helper: require a signed-in user or redirect to the login page. */
export async function requireUser(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
