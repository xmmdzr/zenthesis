import { jsonError, jsonOk } from "@/lib/api";
import { getUserPreferences, updateUserPreferences } from "@/lib/preferences-store";
import { getRequestUserId } from "@/lib/request-user";
import { normalizeTheme } from "@/lib/theme";
import type { Locale } from "@/lib/types";

function normalizeLocale(value: unknown): Locale {
  if (value === "zh" || value === "en" || value === "ru" || value === "fr") {
    return value;
  }

  return "zh";
}

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  const preferences = await getUserPreferences(userId);
  return jsonOk(preferences);
}

export async function PATCH(request: Request) {
  const userId = await getRequestUserId(request);
  const payload = (await request.json().catch(() => null)) as {
    theme?: string;
    locale?: string;
  } | null;

  if (!payload?.theme && !payload?.locale) {
    return jsonError("theme or locale is required", 400);
  }

  const updated = await updateUserPreferences(userId, {
    theme: payload.theme ? normalizeTheme(payload.theme) : undefined,
    locale: payload.locale ? normalizeLocale(payload.locale) : undefined,
  });
  return jsonOk(updated);
}
