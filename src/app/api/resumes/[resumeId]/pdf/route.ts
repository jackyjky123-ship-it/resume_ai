import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import { getResumeForEditor } from "@/server/services/resume.service";
import {
  formatResumePdfFilename,
  renderResumePdf,
} from "@/server/services/pdf.service";

export async function GET(
  request: Request,
  context: { params: Promise<{ resumeId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Your session expired. Sign in again." },
      { status: 401 }
    );
  }

  const { resumeId } = await context.params;
  if (!resumeId || resumeId.length > 64) {
    return NextResponse.json(
      { ok: false, error: "Resume not found." },
      { status: 404 }
    );
  }

  const resume = await getResumeForEditor(user.id, resumeId);
  if (!resume) {
    return NextResponse.json(
      { ok: false, error: "Resume not found." },
      { status: 404 }
    );
  }

  try {
    const pdfBuffer = await renderResumePdf(resume.content, resume.templateId);
    const filename = formatResumePdfFilename(
      resume.content.personal.fullName,
      resume.title
    );

    const url = new URL(request.url);
    const isInline = url.searchParams.get("view") === "inline";
    const dispositionType = isInline ? "inline" : "attachment";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "[pdf-export-route]",
      error instanceof Error ? error.message : "Unexpected PDF rendering error"
    );
    return NextResponse.json(
      { ok: false, error: "Failed to generate resume PDF. Please try again." },
      { status: 500 }
    );
  }
}
