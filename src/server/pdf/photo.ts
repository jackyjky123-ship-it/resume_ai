import "server-only";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import type { ResumeDocument } from "@/lib/validations/resume";

/**
 * PDF rendering runs on the server, so a user-supplied photo URL would make the
 * server fetch arbitrary URLs (SSRF). Uploaded photos are already data URLs;
 * remote URLs are fetched here with strict guards and converted to a data URL
 * before they ever reach @react-pdf/renderer.
 */

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_REDIRECTS = 3;

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg));base64,([a-z0-9+/=\s]+)$/i;

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function ipv4FromMappedIpv6(ip: string): string | null {
  const dotted = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (dotted?.[1]) return dotted[1];

  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(ip);
  if (!hex?.[1] || !hex[2]) return null;

  const high = Number.parseInt(hex[1], 16);
  const low = Number.parseInt(hex[2], 16);
  return [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
}

function isBlockedIpv6(ip: string): boolean {
  const address = ip.toLowerCase().split("%")[0] ?? "";

  const mapped = ipv4FromMappedIpv6(address);
  if (mapped) return isBlockedIpv4(mapped);

  // Only global unicast inside 2000::/3 can be a public destination. This also
  // rejects IPv4-compatible literals such as ::7f00:1 (which the WHATWG URL
  // parser produces from ::127.0.0.1) as well as loopback, ULA, link-local,
  // multicast, and fully expanded spellings of those ranges.
  const [firstGroup, secondGroup] = address.split(":");
  const first = Number.parseInt(firstGroup || "", 16);
  const second = Number.parseInt(secondGroup || "", 16);

  if (!Number.isFinite(first) || first < 0x2000 || first > 0x3fff) {
    return true;
  }

  // Special-purpose ranges that sit inside 2000::/3.
  if (first === 0x2002) return true; // 6to4 tunnels an IPv4 address
  if (first === 0x3ffe || first === 0x3fff) return true; // 6bone + documentation
  if (
    first === 0x2001 &&
    (second === 0x0000 || // Teredo
      second === 0x0002 || // benchmarking
      second === 0x0010 || // ORCHID
      second === 0x0020 || // ORCHIDv2
      second === 0x0db8) // documentation
  ) {
    return true;
  }

  return false;
}

function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isBlockedIpv4(ip);
  if (family === 6) return isBlockedIpv6(ip);
  return true;
}

async function isPublicHost(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host) return false;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return false;
  }

  if (isIP(host) !== 0) return !isBlockedIp(host);

  try {
    const addresses = await lookup(host, { all: true, verbatim: true });
    if (addresses.length === 0) return false;
    return addresses.every((entry) => {
      if (entry.family === 4) return !isBlockedIpv4(entry.address);
      if (entry.family === 6) return !isBlockedIpv6(entry.address);
      return false;
    });
  } catch {
    return false;
  }
}

function detectImageType(bytes: Buffer): "image/png" | "image/jpeg" | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  return null;
}

function normalizeDataUrl(raw: string): string {
  const match = DATA_URL_PATTERN.exec(raw);
  if (!match?.[1] || !match[2]) return "";

  const declaredType = match[1].toLowerCase();
  const base64 = match[2].replace(/\s+/g, "");
  let bytes: Buffer;
  try {
    bytes = Buffer.from(base64, "base64");
  } catch {
    return "";
  }

  if (bytes.length === 0 || bytes.length > MAX_PHOTO_BYTES) return "";

  const actualType = detectImageType(bytes);
  if (!actualType || actualType !== declaredType) return "";

  return `data:${actualType};base64,${base64}`;
}

async function readBodyWithLimit(response: Response): Promise<Buffer | null> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PHOTO_BYTES) {
    return null;
  }

  const reader = response.body?.getReader();
  if (!reader) return null;

  const chunks: Buffer[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > MAX_PHOTO_BYTES) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}

async function fetchRemotePhoto(initialUrl: URL): Promise<string> {
  let url = initialUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (url.protocol !== "https:") return "";
    if (url.username || url.password) return "";
    if (url.port && url.port !== "443") return "";
    if (!(await isPublicHost(url.hostname))) return "";

    const response = await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "image/png,image/jpeg",
        "User-Agent": "resume-ai-pdf/1.0",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return "";
      url = new URL(location, url);
      continue;
    }

    if (!response.ok) return "";

    const contentType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (contentType !== "image/png" && contentType !== "image/jpeg") return "";

    const bytes = await readBodyWithLimit(response);
    if (!bytes) return "";

    const detectedType = detectImageType(bytes);
    if (!detectedType || detectedType !== contentType) return "";

    return `data:${detectedType};base64,${bytes.toString("base64")}`;
  }

  return "";
}

/**
 * Returns a data URL that is safe to hand to the PDF renderer, or "" when the
 * photo cannot be loaded safely. Never throws.
 */
export async function resolveSafePhotoDataUrl(rawPhotoUrl: string): Promise<string> {
  const raw = rawPhotoUrl.trim();
  if (!raw) return "";

  if (/^data:/i.test(raw)) return normalizeDataUrl(raw);

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }

  try {
    return await fetchRemotePhoto(url);
  } catch {
    // Timeouts, TLS failures, DNS races, and malformed responses all degrade to
    // "no photo" rather than failing the whole PDF export.
    return "";
  }
}

/**
 * Clones the resume document with a sanitized photo URL. Documents without a
 * remote photo are returned unchanged.
 */
export async function sanitizeResumePhotoForPdf(
  document: ResumeDocument
): Promise<ResumeDocument> {
  const safePhotoUrl = await resolveSafePhotoDataUrl(document.personal.photoUrl);
  if (safePhotoUrl === document.personal.photoUrl) return document;

  return {
    ...document,
    personal: {
      ...document.personal,
      photoUrl: safePhotoUrl,
    },
  };
}
