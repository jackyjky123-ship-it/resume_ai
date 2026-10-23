import type { ResumeDocument } from "@/lib/validations/resume";

export function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function dateRange(
  start: string,
  end: string,
  current = false,
  locale: "en" | "km" = "en"
): string {
  const endLabel = current ? (locale === "km" ? "បច្ចុប្បន្ន" : "Present") : end.trim();
  return [start.trim(), endLabel].filter(Boolean).join(" – ");
}

export function formatTelegram(raw: string): { label: string; url: string } {
  const trimmed = raw.trim();
  const handle = trimmed
    .replace(/^https?:\/\/(www\.)?(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "");

  if (!handle) {
    return { label: trimmed, url: trimmed };
  }

  return {
    label: `t.me/${handle}`,
    url: `https://t.me/${handle}`,
  };
}

export function contactLine(document: ResumeDocument): string[] {
  const { personal } = document;
  const telegramLabel = hasText(personal.telegram)
    ? formatTelegram(personal.telegram).label
    : "";

  return [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
    telegramLabel,
  ].filter(hasText);
}

export function contactItems(document: ResumeDocument): { label: string; url?: string }[] {
  const { personal } = document;
  const items: { label: string; url?: string }[] = [];

  if (hasText(personal.email)) items.push({ label: personal.email.trim(), url: `mailto:${personal.email.trim()}` });
  if (hasText(personal.phone)) items.push({ label: personal.phone.trim(), url: `tel:${personal.phone.trim()}` });
  if (hasText(personal.location)) items.push({ label: personal.location.trim() });
  if (hasText(personal.website)) {
    const raw = personal.website.trim();
    items.push({ label: raw.replace(/^https?:\/\//i, ""), url: raw.startsWith("http") ? raw : `https://${raw}` });
  }
  if (hasText(personal.linkedin)) {
    const raw = personal.linkedin.trim();
    items.push({ label: raw.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "linkedin.com/in/"), url: raw.startsWith("http") ? raw : `https://${raw}` });
  }
  if (hasText(personal.github)) {
    const raw = personal.github.trim();
    items.push({ label: raw.replace(/^https?:\/\/(www\.)?github\.com\//i, "github.com/"), url: raw.startsWith("http") ? raw : `https://${raw}` });
  }
  if (hasText(personal.telegram)) {
    items.push(formatTelegram(personal.telegram));
  }

  return items;
}

export function languageLabel(name: string, proficiency: string): string {
  const trimmedName = name.trim();
  const trimmedLevel = proficiency.trim();
  if (trimmedName && trimmedLevel) return `${trimmedName} (${trimmedLevel})`;
  return trimmedName || trimmedLevel;
}

