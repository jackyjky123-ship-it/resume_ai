"use client";

const STORAGE_KEY = "resumeai_gemini_api_key";
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToApiKeyStore(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? value.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
    notify();
  } catch {
    // Ignore localStorage write failures (e.g. private browsing quota)
  }
}

export function removeStoredApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    notify();
  } catch {
    // Ignore
  }
}

/**
 * Basic format validation for Google AI Studio / Gemini API keys.
 * Google AI Studio keys start with 'AIza' followed by base64url characters, typically 39 chars total.
 */
export function isValidKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  return /^AIza[0-9A-Za-z-_]{30,60}$/.test(trimmed);
}
