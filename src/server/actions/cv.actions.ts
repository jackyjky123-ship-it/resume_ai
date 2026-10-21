"use server";

import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth/current-user";
import {
  fixGrammarInputSchema,
  generateCvInputSchema,
  improveBulletInputSchema,
  type AiMode,
  type FixGrammarInput,
  type FixGrammarResult,
  type GenerateCvInput,
  type GenerationResult,
  type ImproveBulletInput,
  type ImproveBulletResult,
} from "@/lib/validations/ai";
import {
  fixGrammar,
  generateCvSuggestions,
  improveBullet,
} from "@/server/services/ai.service";
import type { ActionResult } from "./action-result";

export type GenerateCvActionResult = ActionResult<{
  result: GenerationResult;
  mode: AiMode;
}>;

function formatAiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("400") ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("api_key_invalid") ||
      msg.includes("api key not valid") ||
      msg.includes("permission_denied")
    ) {
      return "Your Gemini API key appears to be invalid or expired. Please check your key in settings.";
    }
    if (
      msg.includes("resource_exhausted") ||
      msg.includes("429") ||
      msg.includes("quota")
    ) {
      return "Your Gemini API quota limit was reached. Please wait a moment or check your Google AI Studio account.";
    }
  }
  return fallback;
}

/**
 * BYOK server-authorized suggestion operation. Accepts the user's API key
 * transiently to contact Gemini without persisting or logging it.
 */
export async function generateCvSuggestionsAction(
  rawInput: unknown
): Promise<GenerateCvActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const input: GenerateCvInput = generateCvInputSchema.parse(rawInput);
    const generated = await generateCvSuggestions(input, input.apiKey);

    return {
      ok: true,
      data: {
        result: generated.result,
        mode: generated.mode,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Check the request and try again.",
      };
    }

    // Do not log resume content, provider payloads, or API keys.
    console.error(
      "[cv-suggest-action]",
      error instanceof Error ? error.message : "Unexpected suggestion error"
    );
    return {
      ok: false,
      error: formatAiErrorMessage(
        error,
        "We couldn't generate suggestions right now. Try again in a moment."
      ),
    };
  }
}

export async function improveBulletAction(
  rawInput: unknown
): Promise<ActionResult<ImproveBulletResult & { mode: AiMode }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const input: ImproveBulletInput = improveBulletInputSchema.parse(rawInput);
    const result = await improveBullet(input, input.apiKey);

    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Check the input and try again.",
      };
    }

    console.error(
      "[cv-improve-bullet-action]",
      error instanceof Error ? error.message : "Unexpected bullet improvement error"
    );
    return {
      ok: false,
      error: formatAiErrorMessage(
        error,
        "We couldn't improve that bullet right now. Try again in a moment."
      ),
    };
  }
}

export async function fixGrammarAction(
  rawInput: unknown
): Promise<ActionResult<FixGrammarResult & { mode: AiMode }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const input: FixGrammarInput = fixGrammarInputSchema.parse(rawInput);
    const result = await fixGrammar(input, input.apiKey);

    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Check the input and try again.",
      };
    }

    console.error(
      "[cv-fix-grammar-action]",
      error instanceof Error ? error.message : "Unexpected grammar fix error"
    );
    return {
      ok: false,
      error: formatAiErrorMessage(
        error,
        "We couldn't fix grammar right now. Try again in a moment."
      ),
    };
  }
}
