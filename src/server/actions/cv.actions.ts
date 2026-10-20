"use server";

import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth/current-user";
import {
  generateCvInputSchema,
  type GenerateCvInput,
  type GenerationResult,
} from "@/lib/validations/ai";
import {
  generateCvSuggestions,
  getAiMode,
} from "@/server/services/ai.service";
import type { ActionResult } from "./action-result";

export type GenerateCvActionResult = ActionResult<{
  result: GenerationResult;
  mode: ReturnType<typeof getAiMode>;
}>;

/**
 * Fixed, server-authorized suggestion operation. It never writes to the
 * database: accepted suggestions are applied in the editor and autosaved
 * through the normal validated save path.
 */
export async function generateCvSuggestionsAction(
  rawInput: unknown
): Promise<GenerateCvActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const input: GenerateCvInput = generateCvInputSchema.parse(rawInput);
    const generated = generateCvSuggestions(input);
    return {
      ok: true,
      data: {
        result: generated.result,
        mode: getAiMode(),
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Check the request and try again.",
      };
    }

    // Do not log resume content or provider payloads.
    console.error(
      "[cv-suggest-action]",
      error instanceof Error ? error.message : "Unexpected suggestion error"
    );
    return {
      ok: false,
      error: "We couldn't generate suggestions right now. Try again in a moment.",
    };
  }
}
