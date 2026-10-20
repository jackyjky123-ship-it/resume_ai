import "server-only";

import { unzipSync, strFromU8 } from "fflate";

import {
  CV_IMPORT_MAX_BYTES,
  cvFileExtension,
  formatFileSize,
  isSupportedCvFile,
} from "@/lib/cv-files";

export class CvImportError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CvImportError";
    this.status = status;
  }
}

function displayFileName(fileName: string) {
  const base = fileName.split(/[\\/]/).pop()?.trim() || "Uploaded CV";
  return base.slice(0, 120);
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function docxXmlToText(xml: string) {
  return decodeXmlEntities(
    xml
      .replace(/<w:delText[\s\S]*?<\/w:delText>/gi, "")
      .replace(/<w:instrText[\s\S]*?<\/w:instrText>/gi, "")
      .replace(/<w:tab\b[^>]*\/>/gi, "\t")
      .replace(/<w:br\b[^>]*\/>/gi, "\n")
      .replace(/<\/w:p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(file: File) {
  const { extractText } = await import("unpdf");
  const result = await extractText(new Uint8Array(await file.arrayBuffer()), {
    mergePages: true,
  });
  return result.text;
}

async function extractDocxText(file: File) {
  const zip = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: (entry) =>
      entry.name === "word/document.xml" &&
      entry.originalSize <= 5 * 1024 * 1024,
  });
  const documentXml = zip["word/document.xml"];
  if (!documentXml) {
    throw new CvImportError(
      "That DOCX file doesn't contain readable document text. Try saving it as a PDF or TXT file.",
      422
    );
  }
  return docxXmlToText(strFromU8(documentXml));
}

export async function extractCvTextFromFile(file: File) {
  const fileName = displayFileName(file.name);
  if (!isSupportedCvFile(file.name)) {
    throw new CvImportError("Upload a PDF, DOCX, TXT, or Markdown file.", 415);
  }
  if (file.size === 0) {
    throw new CvImportError("That file is empty.", 422);
  }
  if (file.size > CV_IMPORT_MAX_BYTES) {
    throw new CvImportError(
      `That file is ${formatFileSize(file.size)}. Upload one under ${formatFileSize(
        CV_IMPORT_MAX_BYTES
      )}.`,
      413
    );
  }

  const extension = cvFileExtension(file.name);
  let text = "";

  try {
    if (extension === "pdf") {
      text = await extractPdfText(file);
    } else if (extension === "docx") {
      text = await extractDocxText(file);
    } else {
      text = await file.text();
    }
  } catch (error) {
    if (error instanceof CvImportError) throw error;
    console.error(
      "[cv-import]",
      error instanceof Error ? error.message : "Could not read file"
    );
    throw new CvImportError(
      "We couldn't read that file. Try another copy, or paste the CV text instead.",
      422
    );
  }

  if (text.trim().length < 20) {
    throw new CvImportError(
      "We couldn't find enough text in that file. Scanned PDFs need to be pasted as text for now.",
      422
    );
  }

  return { text, fileName };
}

export async function extractCvText(input: {
  file?: File | null;
  text?: string | null;
}) {
  if (input.file && input.file.size > 0) {
    return extractCvTextFromFile(input.file);
  }

  const pasted = input.text?.trim() ?? "";
  if (pasted.length < 20) {
    throw new CvImportError(
      "Choose a file or paste at least a few lines of CV text.",
      422
    );
  }

  return { text: pasted, fileName: "Pasted CV text" };
}
