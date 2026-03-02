import { randomUUID } from "node:crypto";

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

function mapDoc(
  row: {
    id: string;
    userId: string;
    title: string;
    content: string;
    contentJson: unknown;
    status: string;
    draftType: string | null;
    isSample: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  currentUserId: string,
): DocumentItem {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content,
    contentJson: toObject(row.contentJson),
    status: row.status === "active" ? "active" : "empty",
    draftType: row.draftType as DocumentItem["draftType"],
    isSample: Boolean(row.isSample),
    isOwner: row.userId === currentUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function seedDocs(userId: string): DocumentItem[] {
  return [
    {
      id: randomUUID(),
      userId,
      title: "气候变化与海洋生态研究",
      content: "",
      contentJson: null,
      status: "empty",
      draftType: "standard",
      isSample: true,
      isOwner: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      userId,
      title: "城市韧性政策评估框架",
      content:
        "本文提出一个用于评估城市韧性政策执行效果的分析框架，并对比不同治理结构下的实施差异。",
      contentJson: null,
      status: "active",
      draftType: "smart",
      isSample: true,
      isOwner: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function toUsernameSeed(userId: string) {
  const normalized = userId.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const base = normalized.length >= 6 ? normalized.slice(0, 10) : `${normalized}user1234`;
  return base.slice(0, 10) || "user1234";
}

async function ensureUser(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (existing) {
    return;
  }

  const base = toUsernameSeed(userId);
  let attempt = 0;
  while (attempt < 8) {
    const suffix = attempt === 0 ? "" : String(attempt);
    const candidate = `${base.slice(0, Math.max(1, 10 - suffix.length))}${suffix}`;
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@local.zenthesis.dev`,
          username: candidate,
          passwordHash: "mock-password",
          name: candidate,
        },
      });
      return;
    } catch (error: unknown) {
      if (typeof error === "object" && error && "code" in error) {
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  throw new Error("failed to ensure fallback user");
}

async function seedOwnerDocs(userId: string) {
  const existingCount = await prisma.document.count({ where: { userId } });
  if (existingCount > 0) {
    return;
  }

  const seeded = seedDocs(userId);
  for (const item of seeded) {
    await prisma.document.create({
      data: {
        id: item.id,
        userId,
        title: item.title,
        content: item.content,
        contentJson: toJsonInput(item.contentJson),
        status: item.status,
        draftType: item.draftType,
        isSample: true,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      },
    });
  }
}

export async function listDocs(userId: string): Promise<DocumentItem[]> {
  try {
    await ensureUser(userId);
    await seedOwnerDocs(userId);

    const rows = await prisma.document.findMany({
      where: {
        OR: [
          { userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return rows.map((row) => mapDoc(row, userId));
  } catch {
    if (!docsStore.has(userId)) {
      docsStore.set(userId, seedDocs(userId));
    }

    return (docsStore.get(userId) ?? []).map((doc) => ({
      ...doc,
      isOwner: true,
    }));
  }
}

export async function getDoc(userId: string, docId: string): Promise<DocumentItem | undefined> {
  try {
    const row = await prisma.document.findFirst({
      where: {
        id: docId,
        OR: [
          { userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!row) {
      return undefined;
    }

    return mapDoc(row, userId);
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
        isSample: false,
      },
    });

    return mapDoc(row, userId);
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
      isSample: false,
      isOwner: true,
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
    const accessible = await prisma.document.findFirst({
      where: {
        id: docId,
        OR: [
          { userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!accessible) {
      return undefined;
    }

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

    return mapDoc(row, userId);
  } catch {
    const docs = await listDocs(userId);
    const target = docs.find((item) => item.id === docId && item.isOwner);

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

export async function deleteDoc(userId: string, docId: string) {
  try {
    const result = await prisma.document.deleteMany({
      where: {
        id: docId,
        userId,
      },
    });

    return result.count > 0;
  } catch {
    const current = docsStore.get(userId) ?? [];
    const next = current.filter((item) => item.id !== docId);
    docsStore.set(userId, next);
    return next.length !== current.length;
  }
}
