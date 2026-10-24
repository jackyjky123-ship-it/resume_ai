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

export function triggerApiKeyModal(featureName?: string): void {
  if (typeof window === "undefined") return;
  const featurePrefix = featureName ? `${featureName}: ` : "";
  window.dispatchEvent(
    new CustomEvent("resumeai:open-key-modal", {
      detail: {
        message: `${featurePrefix}Gemini API key is required to use AI features. Please add your key to proceed.`,
      },
    })
  );
}

/**
 * Basic format validation for Google AI Studio / Gemini API keys.
 * Supports:
 * - Legacy Google AI Studio / Cloud keys: starts with 'AIza' (e.g. AIzaSy...)
 * - New Google AI Studio Auth keys: starts with 'AQ.' (e.g. AQ.Ab8RN...)
 */
export function isValidKeyFormat(key: string): boolean {
  const trimmed = key.trim();
  // Legacy format: AIza followed by 30-65 base64url characters
  if (/^AIza[0-9A-Za-z-_]{30,65}$/.test(trimmed)) {
    return true;
  }
  // New Google AI Studio format: AQ. (or AQ) followed by base64url characters
  if (/^AQ[\.\-_0-9A-Za-z]{20,85}$/.test(trimmed)) {
    return true;
  }
  return false;
}
