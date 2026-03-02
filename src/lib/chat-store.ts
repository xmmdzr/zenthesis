import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";
import { getLibraryItemsByIds } from "@/lib/library-store";
import type {
  ConversationAttachment,
  ConversationMessage,
  ConversationSummary,
} from "@/lib/types";

const fallbackConversations = new Map<string, ConversationSummary[]>();
const fallbackMessages = new Map<string, ConversationMessage[]>();
const fallbackAttachments = new Map<string, ConversationAttachment[]>();

let ensuredTables = false;

function nowIso() {
  return new Date().toISOString();
}

function normalizePreview(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

async function ensureUser(userId: string) {
  try {
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
  } catch {
    // fallback mode: no-op
  }
}

async function ensureChatTables() {
  if (ensuredTables) {
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AIConversation (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      preview TEXT NOT NULL DEFAULT '',
      lastMessageAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_aiconv_user ON AIConversation(userId)");
  await prisma.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_aiconv_last_message ON AIConversation(lastMessageAt)",
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AIMessage (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      useWeb INTEGER NOT NULL DEFAULT 0,
      useLibrary INTEGER NOT NULL DEFAULT 0,
      useCurrentDoc INTEGER NOT NULL DEFAULT 0,
      contextDocId TEXT,
      createdAt TEXT NOT NULL
    )
  `);
  await prisma.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_aimessage_conv_created ON AIMessage(conversationId, createdAt)",
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AIConversationLibraryItem (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      libraryItemId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(conversationId, libraryItemId)
    )
  `);
  await prisma.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS idx_aiconvlib_conv ON AIConversationLibraryItem(conversationId)",
  );

  ensuredTables = true;
}

interface ConversationRow {
  id: string;
  userId: string;
  title: string;
  preview: string;
  messageCount: number | bigint;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

interface MessageRow {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  useWeb: number;
  useLibrary: number;
  useCurrentDoc: number;
  contextDocId: string | null;
  createdAt: string;
}

interface AttachmentRow {
  relationId: string;
  conversationId: string;
  libraryItemId: string;
  title: string;
  sourceType: string;
  createdAt: string;
}

interface AttachmentRelationRow {
  relationId: string;
  conversationId: string;
  libraryItemId: string;
  createdAt: string;
}

function mapConversation(row: ConversationRow): ConversationSummary {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    preview: row.preview || "",
    messageCount: Number(row.messageCount),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    lastMessageAt: new Date(row.lastMessageAt).toISOString(),
  };
}

function mapMessage(row: MessageRow): ConversationMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    useWeb: Boolean(row.useWeb),
    useLibrary: Boolean(row.useLibrary),
    useCurrentDoc: Boolean(row.useCurrentDoc),
    contextDocId: row.contextDocId ?? undefined,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

function mapAttachment(row: AttachmentRow): ConversationAttachment {
  return {
    id: row.relationId,
    conversationId: row.conversationId,
    libraryItemId: row.libraryItemId,
    title: row.title,
    sourceType: row.sourceType as ConversationAttachment["sourceType"],
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

function getFallbackConversations(userId: string) {
  if (!fallbackConversations.has(userId)) {
    fallbackConversations.set(userId, []);
  }
  return fallbackConversations.get(userId) ?? [];
}

function getFallbackMessages(conversationId: string) {
  if (!fallbackMessages.has(conversationId)) {
    fallbackMessages.set(conversationId, []);
  }
  return fallbackMessages.get(conversationId) ?? [];
}

function getFallbackAttachments(conversationId: string) {
  if (!fallbackAttachments.has(conversationId)) {
    fallbackAttachments.set(conversationId, []);
  }
  return fallbackAttachments.get(conversationId) ?? [];
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  try {
    await ensureUser(userId);
    await ensureChatTables();
    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT c.id, c.userId, c.title, c.preview, c.createdAt, c.updatedAt, c.lastMessageAt,
             (SELECT COUNT(*) FROM AIMessage m WHERE m.conversationId = c.id) AS messageCount
      FROM AIConversation c
      WHERE c.userId = ?
      ORDER BY datetime(c.lastMessageAt) DESC
      `,
      userId,
    )) as ConversationRow[];
    return rows.map(mapConversation);
  } catch {
    return getFallbackConversations(userId);
  }
}

export async function getConversationSummary(
  userId: string,
  conversationId: string,
): Promise<ConversationSummary | null> {
  try {
    await ensureUser(userId);
    await ensureChatTables();
    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT c.id, c.userId, c.title, c.preview, c.createdAt, c.updatedAt, c.lastMessageAt,
             (SELECT COUNT(*) FROM AIMessage m WHERE m.conversationId = c.id) AS messageCount
      FROM AIConversation c
      WHERE c.userId = ? AND c.id = ?
      LIMIT 1
      `,
      userId,
      conversationId,
    )) as ConversationRow[];

    if (!rows[0]) {
      return null;
    }

    return mapConversation(rows[0]);
  } catch {
    return getFallbackConversations(userId).find((item) => item.id === conversationId) ?? null;
  }
}

export async function createConversation(userId: string, title = "新对话"): Promise<ConversationSummary> {
  const id = randomUUID();
  const timestamp = nowIso();
  const normalizedTitle = title.trim() || "新对话";

  try {
    await ensureUser(userId);
    await ensureChatTables();
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO AIConversation (id, userId, title, preview, lastMessageAt, createdAt, updatedAt)
      VALUES (?, ?, ?, '', ?, ?, ?)
      `,
      id,
      userId,
      normalizedTitle,
      timestamp,
      timestamp,
      timestamp,
    );

    return {
      id,
      userId,
      title: normalizedTitle,
      preview: "",
      messageCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMessageAt: timestamp,
    };
  } catch {
    const item: ConversationSummary = {
      id,
      userId,
      title: normalizedTitle,
      preview: "",
      messageCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastMessageAt: timestamp,
    };
    fallbackConversations.set(userId, [item, ...getFallbackConversations(userId)]);
    return item;
  }
}

export async function getConversationWithMessages(userId: string, conversationId: string): Promise<{
  conversation: ConversationSummary | null;
  messages: ConversationMessage[];
  attachments: ConversationAttachment[];
}> {
  try {
    await ensureUser(userId);
    await ensureChatTables();
    const conversation = await getConversationSummary(userId, conversationId);
    if (!conversation) {
      return { conversation: null, messages: [], attachments: [] };
    }

    const messageRows = (await prisma.$queryRawUnsafe(
      `
      SELECT id, conversationId, role, content, useWeb, useLibrary, useCurrentDoc, contextDocId, createdAt
      FROM AIMessage
      WHERE conversationId = ?
      ORDER BY datetime(createdAt) ASC
      `,
      conversationId,
    )) as MessageRow[];

    let attachmentRows: AttachmentRow[] = [];
    try {
      attachmentRows = (await prisma.$queryRawUnsafe(
        `
        SELECT rel.id AS relationId, rel.conversationId, rel.libraryItemId, rel.createdAt, li.title, li.sourceType
        FROM AIConversationLibraryItem rel
        JOIN LibraryItem li ON li.id = rel.libraryItemId
        WHERE rel.conversationId = ? AND li.userId = ?
        ORDER BY datetime(rel.createdAt) DESC
        `,
        conversationId,
        userId,
      )) as AttachmentRow[];
    } catch {
      const relationRows = (await prisma.$queryRawUnsafe(
        `
        SELECT id AS relationId, conversationId, libraryItemId, createdAt
        FROM AIConversationLibraryItem
        WHERE conversationId = ?
        ORDER BY datetime(createdAt) DESC
        `,
        conversationId,
      )) as AttachmentRelationRow[];
      const itemMap = new Map(
        (await getLibraryItemsByIds(
          userId,
          relationRows.map((item) => item.libraryItemId),
        )).map((item) => [item.id, item]),
      );

      attachmentRows = relationRows.map((row) => ({
        relationId: row.relationId,
        conversationId: row.conversationId,
        libraryItemId: row.libraryItemId,
        title: itemMap.get(row.libraryItemId)?.title || row.libraryItemId,
        sourceType: itemMap.get(row.libraryItemId)?.sourceType || "pdf",
        createdAt: row.createdAt,
      }));
    }

    return {
      conversation,
      messages: messageRows.map(mapMessage),
      attachments: attachmentRows.map(mapAttachment),
    };
  } catch {
    const conversation = getFallbackConversations(userId).find((item) => item.id === conversationId) ?? null;
    if (!conversation) {
      return { conversation: null, messages: [], attachments: [] };
    }

    return {
      conversation,
      messages: getFallbackMessages(conversationId),
      attachments: getFallbackAttachments(conversationId),
    };
  }
}

interface AppendMessagePayload {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  useWeb?: boolean;
  useLibrary?: boolean;
  useCurrentDoc?: boolean;
  contextDocId?: string;
}

export async function appendConversationMessage(userId: string, payload: AppendMessagePayload): Promise<ConversationMessage> {
  const id = randomUUID();
  const timestamp = nowIso();

  try {
    await ensureUser(userId);
    await ensureChatTables();
    const summary = await getConversationSummary(userId, payload.conversationId);
    if (!summary) {
      throw new Error("conversation_not_found");
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO AIMessage (id, conversationId, role, content, useWeb, useLibrary, useCurrentDoc, contextDocId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      id,
      payload.conversationId,
      payload.role,
      payload.content,
      payload.useWeb ? 1 : 0,
      payload.useLibrary ? 1 : 0,
      payload.useCurrentDoc ? 1 : 0,
      payload.contextDocId ?? null,
      timestamp,
    );

    const countRows = (await prisma.$queryRawUnsafe(
      "SELECT COUNT(*) AS count FROM AIMessage WHERE conversationId = ? AND role = 'user'",
      payload.conversationId,
    )) as Array<{ count: number | bigint }>;
    const userCount = Number(countRows[0]?.count ?? 0);

    const preview = normalizePreview(payload.content);
    let nextTitle = summary.title;
    if (payload.role === "user" && userCount <= 1 && (summary.title === "新对话" || summary.title === "New chat")) {
      nextTitle = payload.content.trim().slice(0, 22) || summary.title;
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE AIConversation
      SET preview = ?, title = ?, lastMessageAt = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
      `,
      preview,
      nextTitle,
      timestamp,
      timestamp,
      payload.conversationId,
      userId,
    );

    return {
      id,
      conversationId: payload.conversationId,
      role: payload.role,
      content: payload.content,
      useWeb: Boolean(payload.useWeb),
      useLibrary: Boolean(payload.useLibrary),
      useCurrentDoc: Boolean(payload.useCurrentDoc),
      contextDocId: payload.contextDocId,
      createdAt: timestamp,
    };
  } catch {
    const fallback = getFallbackConversations(userId).find((item) => item.id === payload.conversationId);
    const preview = normalizePreview(payload.content);
    if (fallback) {
      fallback.preview = preview;
      fallback.updatedAt = timestamp;
      fallback.lastMessageAt = timestamp;
      if (payload.role === "user" && fallback.messageCount === 0 && fallback.title === "新对话") {
        fallback.title = payload.content.trim().slice(0, 22) || fallback.title;
      }
      fallback.messageCount += 1;
    }

    const message: ConversationMessage = {
      id,
      conversationId: payload.conversationId,
      role: payload.role,
      content: payload.content,
      useWeb: Boolean(payload.useWeb),
      useLibrary: Boolean(payload.useLibrary),
      useCurrentDoc: Boolean(payload.useCurrentDoc),
      contextDocId: payload.contextDocId,
      createdAt: timestamp,
    };
    fallbackMessages.set(payload.conversationId, [...getFallbackMessages(payload.conversationId), message]);
    return message;
  }
}

export async function linkConversationLibraryItems(conversationId: string, itemIds: string[]) {
  const uniqueItemIds = Array.from(new Set(itemIds.filter(Boolean)));
  if (uniqueItemIds.length === 0) {
    return;
  }

  try {
    await ensureChatTables();
    for (const itemId of uniqueItemIds) {
      await prisma.$executeRawUnsafe(
        `
        INSERT OR IGNORE INTO AIConversationLibraryItem (id, conversationId, libraryItemId, createdAt)
        VALUES (?, ?, ?, ?)
        `,
        randomUUID(),
        conversationId,
        itemId,
        nowIso(),
      );
    }
  } catch {
    const current = getFallbackAttachments(conversationId);
    const now = nowIso();
    const next = [...current];
    for (const itemId of uniqueItemIds) {
      if (next.some((item) => item.libraryItemId === itemId)) {
        continue;
      }
      next.push({
        id: randomUUID(),
        conversationId,
        libraryItemId: itemId,
        title: itemId,
        sourceType: "pdf",
        createdAt: now,
      });
    }
    fallbackAttachments.set(conversationId, next);
  }
}

export async function deleteConversation(userId: string, conversationId: string): Promise<boolean> {
  try {
    await ensureUser(userId);
    await ensureChatTables();
    const summary = await getConversationSummary(userId, conversationId);
    if (!summary) {
      return false;
    }

    await prisma.$executeRawUnsafe(
      "DELETE FROM AIConversationLibraryItem WHERE conversationId = ?",
      conversationId,
    );
    await prisma.$executeRawUnsafe(
      "DELETE FROM AIMessage WHERE conversationId = ?",
      conversationId,
    );
    await prisma.$executeRawUnsafe(
      "DELETE FROM AIConversation WHERE id = ? AND userId = ?",
      conversationId,
      userId,
    );
    return true;
  } catch {
    const conversations = getFallbackConversations(userId);
    const exists = conversations.some((item) => item.id === conversationId);
    if (!exists) {
      return false;
    }
    fallbackConversations.set(
      userId,
      conversations.filter((item) => item.id !== conversationId),
    );
    fallbackMessages.delete(conversationId);
    fallbackAttachments.delete(conversationId);
    return true;
  }
}

export async function listConversationLibraryItems(
  userId: string,
  conversationId: string,
): Promise<ConversationAttachment[]> {
  const data = await getConversationWithMessages(userId, conversationId);
  return data.attachments;
}
