"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AiMode } from "@/lib/validations/ai";
import {
  getStoredApiKey,
  isValidKeyFormat,
  removeStoredApiKey,
  setStoredApiKey,
  subscribeToApiKeyStore,
} from "./api-key-store";

type ApiKeyContextValue = {
  apiKey: string | null;
  aiMode: AiMode;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isValidFormat: boolean;
  hasKey: boolean;
};

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

function getServerSnapshot(): null {
  return null;
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const apiKey = useSyncExternalStore(
    subscribeToApiKeyStore,
    getStoredApiKey,
    getServerSnapshot
  );

  const setApiKey = useCallback((key: string) => {
    setStoredApiKey(key);
  }, []);

  const clearApiKey = useCallback(() => {
    removeStoredApiKey();
  }, []);

  const hasKey = Boolean(apiKey && apiKey.length > 0);
  const isValidFormat = hasKey ? isValidKeyFormat(apiKey!) : false;
  // If user entered a key, mode is gemini; otherwise mock fallback
  const aiMode: AiMode = hasKey ? "gemini" : "mock";

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        aiMode,
        setApiKey,
        clearApiKey,
        isValidFormat,
        hasKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey(): ApiKeyContextValue {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return ctx;
}
