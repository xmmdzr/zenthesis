"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

import { enMessages } from "@/lib/i18n/messages/en";
import { frMessages } from "@/lib/i18n/messages/fr";
import { ruMessages } from "@/lib/i18n/messages/ru";
import { zhMessages } from "@/lib/i18n/messages/zh";
import type { LocaleOption, Messages } from "@/lib/i18n/types";
import type { Locale } from "@/lib/types";

const LOCALE_STORAGE_KEY = "zenthesis-locale";

const localeMessages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
  ru: ruMessages,
  fr: frMessages,
};

const localeOptions: LocaleOption[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "fr", label: "Français" },
];

interface I18nContextValue {
  locale: Locale;
  setLocale: (nextLocale: Locale) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  localeOptions: LocaleOption[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function normalizeLocale(value: unknown): Locale {
  if (value === "en" || value === "ru" || value === "fr" || value === "zh") {
    return value;
  }

  return "zh";
}

function translate(locale: Locale, key: string, params?: Record<string, string | number>) {
  const msg = localeMessages[locale][key] ?? localeMessages.zh[key] ?? key;
  if (!params) {
    return msg;
  }

  return msg.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "zh";
    }

    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  });

  useEffect(() => {
    void fetch("/api/settings/preferences", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const pref = (await response.json()) as { locale?: Locale };
        const normalized = normalizeLocale(pref.locale);
        setLocaleState(normalized);
        localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
      })
      .catch(() => {
        // no-op: local fallback is enough
      });
  }, []);

  const setLocale = async (nextLocale: Locale) => {
    const normalized = normalizeLocale(nextLocale);
    setLocaleState(normalized);
    localStorage.setItem(LOCALE_STORAGE_KEY, normalized);

    try {
      await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale: normalized }),
      });
    } catch {
      // keep local locale even if server persistence fails
    }
  };

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params),
    localeOptions,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return ctx;
}
