"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AiMode } from "@/lib/validations/ai";
import {
  getStoredApiKey,
  isValidKeyFormat,
  removeStoredApiKey,
  setStoredApiKey,
  subscribeToApiKeyStore,
  triggerApiKeyModal,
} from "./api-key-store";

type ApiKeyContextValue = {
  apiKey: string | null;
  aiMode: AiMode;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isValidFormat: boolean;
  hasKey: boolean;
  isKeyDialogOpen: boolean;
  setKeyDialogOpen: (open: boolean) => void;
  openKeySettings: () => void;
  promptApiKey: (featureName?: string) => void;
};

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

function getServerSnapshot(): null {
  return null;
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [isKeyDialogOpen, setKeyDialogOpen] = useState(false);

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

  const openKeySettings = useCallback(() => {
    setKeyDialogOpen(true);
  }, []);

  const promptApiKey = useCallback((featureName?: string) => {
    const featurePrefix = featureName ? `${featureName}: ` : "";
    toast.warning(
      `${featurePrefix}Gemini API key is required to use AI features. Please add your key to proceed.`,
      {
        action: {
          label: "Add API Key",
          onClick: () => {
            setKeyDialogOpen(true);
            triggerApiKeyModal();
          },
        },
      }
    );
    setKeyDialogOpen(true);
    triggerApiKeyModal(featureName);
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
        isKeyDialogOpen,
        setKeyDialogOpen,
        openKeySettings,
        promptApiKey,
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
  return {
    ...ctx,
    isKeyDialogOpen: ctx.isKeyDialogOpen ?? false,
    setKeyDialogOpen: ctx.setKeyDialogOpen ?? (() => {}),
    openKeySettings:
      ctx.openKeySettings ??
      (() => {
        triggerApiKeyModal();
        ctx.setKeyDialogOpen?.(true);
      }),
    promptApiKey:
      ctx.promptApiKey ??
      ((featureName?: string) => {
        const featurePrefix = featureName ? `${featureName}: ` : "";
        toast.warning(
          `${featurePrefix}Gemini API key is required to use AI features. Please add your key to proceed.`
        );
        triggerApiKeyModal(featureName);
        ctx.setKeyDialogOpen?.(true);
      }),
  };
}
