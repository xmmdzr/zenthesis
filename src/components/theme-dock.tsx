"use client";

import { Check, ChevronDown, Laptop, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import type { ThemePreference } from "@/lib/types";

const options: Array<{ value: ThemePreference; icon: typeof Laptop; labelKey: string }> = [
  { value: "system", icon: Laptop, labelKey: "theme.system" },
  { value: "light", icon: SunMedium, labelKey: "theme.light" },
  { value: "dark", icon: Moon, labelKey: "theme.dark" },
];

export function ThemeDock() {
  const { theme, setTheme } = useTheme();
  const { locale, localeOptions, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-2 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-[color:var(--surface)] p-1">
          {options.map((item) => {
            const Icon = item.icon;
            const active = theme === item.value || (theme === undefined && item.value === "system");

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setTheme(item.value)}
                className={`rounded-lg p-2 transition ${
                  active ? "bg-[color:var(--card)] shadow-sm" : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
                }`}
                title={t(item.labelKey)}
                aria-label={t(item.labelKey)}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-xs font-semibold text-[color:var(--foreground)]"
            aria-label={t("lang.label")}
            onClick={() => setOpen((prev) => !prev)}
          >
            {locale.toUpperCase()} <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {open && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label={t("common.close")}
                onClick={() => setOpen(false)}
              />
              <div className="absolute bottom-[calc(100%+8px)] right-0 z-20 w-[220px] rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2 shadow-xl">
                <p className="px-2 py-1 text-xs font-semibold text-[color:var(--muted-foreground)]">
                  {t("lang.label")}
                </p>
                {localeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      void setLocale(option.value);
                      setOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-[color:var(--surface)]"
                  >
                    {option.label}
                    {locale === option.value && <Check className="h-4 w-4 text-[color:var(--accent)]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-2 w-full rounded-xl bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-[color:var(--accent-foreground)]"
      >
        ⚡ {t("common.pricing")}
      </button>
    </div>
  );
}
