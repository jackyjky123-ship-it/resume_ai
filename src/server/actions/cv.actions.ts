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
  getAiMode,
  improveBullet,
} from "@/server/services/ai.service";
import {
  checkAiQuota,
  recordAiUsage,
} from "@/server/services/ai-quota.service";
import type { ActionResult } from "./action-result";

export type GenerateCvActionResult = ActionResult<{
  result: GenerationResult;
  mode: ReturnType<typeof getAiMode>;
}>;

const QUOTA_EXHAUSTED_MESSAGE =
  "You've used all 10 AI requests for today. You can continue editing manually, or try again tomorrow.";

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

    const mode = getAiMode();
    if (mode === "gemini") {
      const quota = await checkAiQuota(user.id);
      if (!quota.allowed) {
        return { ok: false, error: QUOTA_EXHAUSTED_MESSAGE };
      }
    }

    const input: GenerateCvInput = generateCvInputSchema.parse(rawInput);
    const generated = await generateCvSuggestions(input);

    if (mode === "gemini") {
      await recordAiUsage(user.id, "generate_suggestions");
    }

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

export async function improveBulletAction(
  rawInput: unknown
): Promise<ActionResult<ImproveBulletResult & { mode: AiMode }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const mode = getAiMode();
    if (mode === "gemini") {
      const quota = await checkAiQuota(user.id);
      if (!quota.allowed) {
        return { ok: false, error: QUOTA_EXHAUSTED_MESSAGE };
      }
    }

    const input: ImproveBulletInput = improveBulletInputSchema.parse(rawInput);
    const result = await improveBullet(input);

    if (mode === "gemini") {
      await recordAiUsage(user.id, "improve_bullet");
    }

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
      error: "We couldn't improve that bullet right now. Try again in a moment.",
    };
  }
}

export async function fixGrammarAction(
  rawInput: unknown
): Promise<ActionResult<FixGrammarResult & { mode: AiMode }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const mode = getAiMode();
    if (mode === "gemini") {
      const quota = await checkAiQuota(user.id);
      if (!quota.allowed) {
        return { ok: false, error: QUOTA_EXHAUSTED_MESSAGE };
      }
    }

    const input: FixGrammarInput = fixGrammarInputSchema.parse(rawInput);
    const result = await fixGrammar(input);

    if (mode === "gemini") {
      await recordAiUsage(user.id, "fix_grammar");
    }

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
      error: "We couldn't fix grammar right now. Try again in a moment.",
    };
  }
}

export async function getAiQuotaAction(): Promise<
  ActionResult<{
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    mode: AiMode;
  }>
> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const mode = getAiMode();
    const quota = await checkAiQuota(user.id);

    return {
      ok: true,
      data: {
        ...quota,
        mode,
      },
    };
  } catch (error) {
    console.error(
      "[cv-quota-action]",
      error instanceof Error ? error.message : "Unexpected quota check error"
    );
    return {
      ok: false,
      error: "Couldn't retrieve AI quota.",
    };
  }
}
