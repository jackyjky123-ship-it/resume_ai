/** Shared limits and helpers for the CV import UI and API route. */

export const CV_IMPORT_MAX_BYTES = 4 * 1024 * 1024;
export const CV_IMPORT_MAX_TEXT = 30_000;
export const CV_IMPORT_ACCEPT = ".pdf,.docx,.txt,.md";

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "md"] as const;

export type CvFileExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function cvFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedCvFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(cvFileExtension(fileName) as CvFileExtension);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
