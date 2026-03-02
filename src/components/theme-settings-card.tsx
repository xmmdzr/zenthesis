"use client";

import { useTheme } from "next-themes";
import { useState } from "react";

import { useI18n } from "@/components/i18n-provider";
import type { ThemePreference } from "@/lib/types";

const options: ThemePreference[] = ["system", "light", "dark"];

export function ThemeSettingsCard() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onThemeChange(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: nextTheme }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist preference");
      }

      setMessage("Theme preference saved.");
    } catch {
      setMessage("Failed to save theme preference. UI still applies locally.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
      <h2 className="text-lg font-semibold">{t("common.settings")}</h2>
      <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
        Switch system/light/dark and persist your preference.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onThemeChange(option)}
            className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
              theme === option
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                : "border-[color:var(--border)] hover:border-[color:var(--accent)]"
            }`}
            disabled={saving}
          >
            {option}
          </button>
        ))}
      </div>

      {message && <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{message}</p>}
    </section>
  );
}
