import type { ThemePreference } from "@/lib/types";

export const THEME_STORAGE_KEY = "zenthesis-theme";

export function resolveSystemTheme(prefersDark: boolean): Exclude<ThemePreference, "system"> {
  return prefersDark ? "dark" : "light";
}

export function normalizeTheme(value: string | null | undefined): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}
