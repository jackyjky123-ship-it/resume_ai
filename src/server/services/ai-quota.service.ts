import "server-only";

import { prisma } from "@/lib/prisma";

/** Configurable product policy — not a provider guarantee. */
export const DAILY_LIMIT = 10;

/**
 * Count the user's AI actions in the current UTC day.
 * Uses an atomic DB query rather than in-memory state for reliability.
 */
export async function countTodayUsage(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  return prisma.aIUsage.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });
}

export async function checkAiQuota(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const used = await countTodayUsage(userId);
  const remaining = Math.max(0, DAILY_LIMIT - used);
  return {
    allowed: used < DAILY_LIMIT,
    used,
    limit: DAILY_LIMIT,
    remaining,
  };
}

export async function recordAiUsage(
  userId: string,
  action: string
): Promise<void> {
  await prisma.aIUsage.create({
    data: { userId, action },
  });
}
