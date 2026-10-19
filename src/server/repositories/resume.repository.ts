import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Minimal fields needed to verify ownership and render dashboard cards.
 * Never select more than needed when the client touches the result.
 */
const listSelect = {
  id: true,
  title: true,
  templateId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ResumeSelect;

/** List every resume owned by the user. Ownership comes from the session. */
export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: listSelect,
  });
}

/** Create a resume for the user. Content is validated by the caller (Zod, Phase 4). */
export async function createResume(
  userId: string,
  data: { title: string; templateId: string; content: Prisma.InputJsonValue }
) {
  return prisma.resume.create({
    data: { userId, ...data },
    select: listSelect,
  });
}

/**
 * Fetch one resume only if it belongs to the user.
 * Enforces PLAN.md invariant: ownership is always verified server-side.
 */
export async function getResumeOwnedBy(userId: string, resumeId: string) {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });
}

/** Update a resume only if it belongs to the user. */
export async function updateResumeOwnedBy(
  userId: string,
  resumeId: string,
  data: { title?: string; templateId?: string; content?: Prisma.InputJsonValue }
) {
  return prisma.resume.update({
    where: { id: resumeId, userId },
    data,
    select: listSelect,
  });
}

/** Delete a resume only if it belongs to the user. */
export async function deleteResumeOwnedBy(userId: string, resumeId: string) {
  return prisma.resume.delete({
    where: { id: resumeId, userId },
    select: { id: true },
  });
}
