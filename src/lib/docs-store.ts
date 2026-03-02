import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { DocumentItem } from "@/lib/types";

const docsStore = new Map<string, DocumentItem[]>();

function toObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function toJsonInput(
  value: Record<string, unknown> | null | undefined,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return value as Prisma.InputJsonValue;
}

function mapDoc(row: {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentJson: unknown;
  status: string;
  draftType: string | null;
  createdAt: Date;
  updatedAt: Date;
}): DocumentItem {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content,
    contentJson: toObject(row.contentJson),
    status: row.status === "active" ? "active" : "empty",
    draftType: row.draftType as DocumentItem["draftType"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function seedDocs(userId: string): DocumentItem[] {
  return [
    {
      id: "doc-1",
      userId,
      title: "气候变化与海洋生态研究",
      content: "",
      contentJson: null,
      status: "empty",
      draftType: "standard",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "doc-2",
      userId,
      title: "城市韧性政策评估框架",
      content:
        "本文提出一个用于评估城市韧性政策执行效果的分析框架，并对比不同治理结构下的实施差异。",
      contentJson: null,
      status: "active",
      draftType: "smart",
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
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

export async function listDocs(userId: string): Promise<DocumentItem[]> {
  try {
    await ensureUser(userId);
    const rows = await prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (rows.length === 0) {
      for (const seeded of seedDocs(userId)) {
        await prisma.document.create({
          data: {
            id: seeded.id,
            userId,
            title: seeded.title,
            content: seeded.content,
            contentJson: toJsonInput(seeded.contentJson),
            status: seeded.status,
            draftType: seeded.draftType,
            createdAt: new Date(seeded.createdAt),
            updatedAt: new Date(seeded.updatedAt),
          },
        });
      }

      return seedDocs(userId);
    }

    return rows.map(mapDoc);
  } catch {
    if (!docsStore.has(userId)) {
      docsStore.set(userId, seedDocs(userId));
    }

    return docsStore.get(userId) ?? [];
  }
}

export async function getDoc(userId: string, docId: string): Promise<DocumentItem | undefined> {
  try {
    const row = await prisma.document.findFirst({ where: { userId, id: docId } });
    if (!row) {
      return undefined;
    }

    return mapDoc(row);
  } catch {
    const docs = await listDocs(userId);
    return docs.find((item) => item.id === docId);
  }
}

export async function createDoc(
  userId: string,
  payload: { title: string; draftType?: "standard" | "smart" | "blank"; seedPrompt?: string },
): Promise<DocumentItem> {
  const normalizedTitle = payload.title.trim();
  const title =
    normalizedTitle ||
    (payload.draftType === "smart"
      ? `智能标题：${(payload.seedPrompt || "研究主题").slice(0, 14)}`
      : "未命名");

  try {
    await ensureUser(userId);
    const row = await prisma.document.create({
      data: {
        userId,
        title,
        content: "",
        contentJson: toJsonInput({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
        status: "active",
        draftType: payload.draftType ?? "standard",
      },
    });

    return mapDoc(row);
  } catch {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      userId,
      title,
      content: "",
      contentJson: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
      status: "active",
      draftType: payload.draftType ?? "standard",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    docsStore.set(userId, [newDoc, ...(docsStore.get(userId) ?? seedDocs(userId))]);
    return newDoc;
  }
}

export async function updateDoc(
  userId: string,
  docId: string,
  updates: Partial<Pick<DocumentItem, "title" | "content" | "contentJson" | "status">>,
): Promise<DocumentItem | undefined> {
  const nextStatus =
    typeof updates.status === "string"
      ? updates.status
      : typeof updates.content === "string" && updates.content.trim().length > 0
        ? "active"
        : undefined;

  try {
    const row = await prisma.document.update({
      where: { id: docId },
      data: {
        ...(typeof updates.title === "string" ? { title: updates.title } : {}),
        ...(typeof updates.content === "string" ? { content: updates.content } : {}),
        ...(updates.contentJson === null
          ? { contentJson: Prisma.JsonNull }
          : updates.contentJson
            ? { contentJson: toJsonInput(updates.contentJson) }
            : {}),
        ...(nextStatus ? { status: nextStatus } : {}),
      },
    });

    if (row.userId !== userId) {
      return undefined;
    }

    return mapDoc(row);
  } catch {
    const docs = await listDocs(userId);
    const target = docs.find((item) => item.id === docId);

    if (!target) {
      return undefined;
    }

    if (typeof updates.title === "string") {
      target.title = updates.title;
    }

    if (typeof updates.content === "string") {
      target.content = updates.content;
    }

    if (updates.contentJson) {
      target.contentJson = updates.contentJson;
    }

    if (nextStatus) {
      target.status = nextStatus;
    }

    target.updatedAt = new Date().toISOString();
    return target;
  }
}
