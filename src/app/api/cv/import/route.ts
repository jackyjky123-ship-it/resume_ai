import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSessionUser } from "@/lib/auth/current-user";
import { importCvText } from "@/server/services/ai.service";
import {
  CvImportError,
  extractCvText,
} from "@/server/services/cv-import.service";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Your session expired. Sign in again." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const textEntry = formData.get("text");
    const file = fileEntry instanceof File ? fileEntry : null;
    const text = typeof textEntry === "string" ? textEntry : null;

    const apiKeyEntry = formData.get("apiKey");
    const apiKey = typeof apiKeyEntry === "string" && apiKeyEntry.trim().length > 0 ? apiKeyEntry.trim() : undefined;

    const extracted = await extractCvText({ file, text });
    const result = await importCvText(extracted.text, extracted.fileName, apiKey);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof CvImportError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "That CV had an unusual structure we couldn't map safely. Try pasting the text instead.",
        },
        { status: 422 }
      );
    }

    // Never log extracted CV text or file contents.
    console.error(
      "[cv-import-route]",
      error instanceof Error ? error.message : "Unexpected import error"
    );
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't process that CV right now. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
