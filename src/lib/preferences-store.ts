import { prisma } from "@/lib/db";
import type { Locale, UserPreferences } from "@/lib/types";
import { normalizeTheme } from "@/lib/theme";

const fallbackStore = new Map<string, UserPreferences>();
const DB_ENABLED = process.env.NODE_ENV !== "test";

function normalizeLocale(value: unknown): Locale {
  if (value === "zh" || value === "en" || value === "ru" || value === "fr") {
    return value;
  }

  return "zh";
}

async function ensureUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@local.zenthesis.dev`,
      passwordHash: "mock-password",
      name: userId,
    },
  });
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    if (!DB_ENABLED) {
      throw new Error("db disabled in test");
    }

    await ensureUser(userId);
    const row = await prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        theme: "system",
        locale: "zh",
      },
    });

    return {
      userId,
      theme: normalizeTheme(row.theme),
      locale: normalizeLocale(row.locale),
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch {
    const fallback = fallbackStore.get(userId);
    if (fallback) {
      return fallback;
    }

    const initial: UserPreferences = {
      userId,
      theme: "system",
      locale: "zh",
      updatedAt: new Date().toISOString(),
    };

    fallbackStore.set(userId, initial);
    return initial;
  }
}

export async function updateUserPreferences(
  userId: string,
  payload: Partial<Pick<UserPreferences, "theme" | "locale">>,
): Promise<UserPreferences> {
  const current = await getUserPreferences(userId);
  const normalizedTheme = normalizeTheme(payload.theme ?? current.theme);
  const normalizedLocale = normalizeLocale(payload.locale ?? current.locale);

  try {
    if (!DB_ENABLED) {
      throw new Error("db disabled in test");
    }

    await ensureUser(userId);
    const row = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        theme: normalizedTheme,
        locale: normalizedLocale,
      },
      create: {
        userId,
        theme: normalizedTheme,
        locale: normalizedLocale,
      },
    });

    return {
      userId,
      theme: normalizeTheme(row.theme),
      locale: normalizeLocale(row.locale),
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch {
    const updated: UserPreferences = {
      userId,
      theme: normalizedTheme,
      locale: normalizedLocale,
      updatedAt: new Date().toISOString(),
    };

    fallbackStore.set(userId, updated);
    return updated;
  }
}

export function __resetPreferenceStoreForTests() {
  fallbackStore.clear();
}
