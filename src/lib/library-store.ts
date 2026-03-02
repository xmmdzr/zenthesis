import { prisma } from "@/lib/db";
import type { LibraryItem, SourceType } from "@/lib/types";

const libraryStore = new Map<string, LibraryItem[]>();

function toArray(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

function mapItem(row: {
  id: string;
  userId: string;
  sourceType: string;
  title: string;
  authors: string;
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  createdAt: Date;
}): LibraryItem {
  return {
    id: row.id,
    userId: row.userId,
    sourceType: row.sourceType as SourceType,
    title: row.title,
    authors: toArray(row.authors),
    year: row.year ?? undefined,
    venue: row.venue ?? undefined,
    doi: row.doi ?? undefined,
    url: row.url ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
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

export async function listLibraryItems(userId: string): Promise<LibraryItem[]> {
  try {
    await ensureUser(userId);
    const rows = await prisma.libraryItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapItem);
  } catch {
    if (!libraryStore.has(userId)) {
      libraryStore.set(userId, []);
    }

    return libraryStore.get(userId) ?? [];
  }
}

export async function createLibraryItem(userId: string, sourceType: SourceType, title: string): Promise<LibraryItem> {
  try {
    await ensureUser(userId);
    const row = await prisma.libraryItem.create({
      data: {
        userId,
        sourceType,
        title,
        authors: "[]",
      },
    });

    return mapItem(row);
  } catch {
    const item: LibraryItem = {
      id: `lib-${Date.now()}`,
      userId,
      sourceType,
      title,
      authors: [],
      createdAt: new Date().toISOString(),
    };

    libraryStore.set(userId, [item, ...(libraryStore.get(userId) ?? [])]);
    return item;
  }
}

export async function getLibraryItemsByIds(userId: string, itemIds: string[]): Promise<LibraryItem[]> {
  const uniqueIds = Array.from(new Set(itemIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return [];
  }

  try {
    const rows = await prisma.libraryItem.findMany({
      where: {
        userId,
        id: {
          in: uniqueIds,
        },
      },
    });

    return rows.map(mapItem);
  } catch {
    const items = await listLibraryItems(userId);
    const idSet = new Set(uniqueIds);
    return items.filter((item) => idSet.has(item.id));
  }
}
