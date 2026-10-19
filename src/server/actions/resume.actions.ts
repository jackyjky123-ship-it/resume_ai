"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/current-user";
import type { DashboardResume } from "@/lib/resume-meta";
import {
  createResumeInputSchema,
  renameResumeInputSchema,
} from "@/lib/validations/resume";
import {
  createResumeForUser,
  deleteResumeForUser,
  duplicateResumeForUser,
  renameResumeForUser,
  saveResumeForUser,
} from "@/server/services/resume.service";
import type { ActionResult } from "./action-result";

const resumeIdSchema = z.string().min(1).max(64);

function failure(error: unknown): ActionResult<never> {
  if (error instanceof z.ZodError) {
    return {
      ok: false,
      error: error.issues[0]?.message ?? "Check the form and try again.",
    };
  }

  // Never log resume content or credentials — the message is enough.
  console.error(
    "[resume-action]",
    error instanceof Error ? error.message : "Unexpected error"
  );
  return {
    ok: false,
    error: "Something went wrong. Your changes are still in the editor — try again.",
  };
}

async function currentUserId() {
  const user = await getSessionUser();
  return user?.id ?? null;
}

export async function createResumeAction(
  rawInput: unknown
): Promise<ActionResult<DashboardResume>> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const input = createResumeInputSchema.parse(rawInput);
    const resume = await createResumeForUser(user.id, input);
    revalidatePath("/dashboard");
    return { ok: true, data: resume };
  } catch (error) {
    return failure(error);
  }
}

export async function renameResumeAction(
  rawInput: unknown
): Promise<ActionResult<DashboardResume>> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Your session expired. Sign in again." };

    const input = renameResumeInputSchema.parse(rawInput);
    const resume = await renameResumeForUser(userId, input.resumeId, input.title);
    if (!resume) return { ok: false, error: "That resume no longer exists." };

    revalidatePath("/dashboard");
    return { ok: true, data: resume };
  } catch (error) {
    return failure(error);
  }
}

export async function duplicateResumeAction(
  resumeId: string
): Promise<ActionResult<DashboardResume>> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Your session expired. Sign in again." };

    const id = resumeIdSchema.parse(resumeId);
    const resume = await duplicateResumeForUser(userId, id);
    if (!resume) return { ok: false, error: "That resume no longer exists." };

    revalidatePath("/dashboard");
    return { ok: true, data: resume };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteResumeAction(
  resumeId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Your session expired. Sign in again." };

    const id = resumeIdSchema.parse(resumeId);
    const deleted = await deleteResumeForUser(userId, id);
    if (!deleted) return { ok: false, error: "That resume no longer exists." };

    revalidatePath("/dashboard");
    return { ok: true, data: { id } };
  } catch (error) {
    return failure(error);
  }
}

export async function saveResumeAction(
  rawInput: unknown
): Promise<ActionResult<{ id: string; updatedAt: string }>> {
  try {
    const userId = await currentUserId();
    if (!userId) return { ok: false, error: "Your session expired. Sign in again." };

    const saved = await saveResumeForUser(userId, rawInput);
    return { ok: true, data: saved };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return { ok: false, error: "That resume no longer exists." };
    }
    return failure(error);
  }
}
