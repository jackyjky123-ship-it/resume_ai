"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { en } from "./en";
import { km } from "./km";
import type { Locale, Translations } from "./types";

const STORAGE_KEY = "niseth_locale";
const COOKIE_NAME = "niseth_locale";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
  isKhmer: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const subscribeLocale = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("niseth_locale_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("niseth_locale_change", callback);
  };
};

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "km") return stored;

    const cookieMatch = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (cookieMatch) {
      const val = cookieMatch.split("=")[1];
      if (val === "en" || val === "km") return val;
    }

    if (navigator.language.toLowerCase().startsWith("km")) {
      return "km";
    }
  } catch {
    // Ignore storage errors in private/sandboxed frames
  }

  return "en";
}

function getServerSnapshot(): Locale {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.setAttribute("data-locale", locale);
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new Event("niseth_locale_change"));
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
      document.documentElement.setAttribute("data-locale", newLocale);
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "km" : "en");
  }, [locale, setLocale]);

  const t = useMemo(() => {
    return locale === "km" ? km : en;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      isKhmer: locale === "km",
    }),
    [locale, setLocale, toggleLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Safe fallback if used outside provider (e.g. during static build)
    return {
      locale: "en",
      setLocale: () => {},
      toggleLocale: () => {},
      t: en,
      isKhmer: false,
    };
  }
  return context;
}
