import { createHash, randomBytes, randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildRawToken() {
  return `${randomUUID().replace(/-/g, "")}${randomBytes(12).toString("hex")}`;
}

export async function createShareLink(ownerId: string, docId: string) {
  const doc = await prisma.document.findFirst({
    where: {
      id: docId,
      userId: ownerId,
    },
    select: {
      id: true,
    },
  });

  if (!doc) {
    return null;
  }

  await prisma.documentShareLink.updateMany({
    where: {
      docId,
      ownerId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  const rawToken = buildRawToken();
  const tokenHash = hashToken(rawToken);
  const link = await prisma.documentShareLink.create({
    data: {
      docId,
      ownerId,
      tokenHash,
      canEdit: true,
    },
    select: {
      id: true,
      docId: true,
      canEdit: true,
      createdAt: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  return {
    ...link,
    token: rawToken,
  };
}

export async function getActiveShareLink(ownerId: string, docId: string) {
  const link = await prisma.documentShareLink.findFirst({
    where: {
      ownerId,
      docId,
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      canEdit: true,
      createdAt: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  return link;
}

export async function revokeShareLink(ownerId: string, docId: string) {
  const result = await prisma.documentShareLink.updateMany({
    where: {
      ownerId,
      docId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return result.count > 0;
}

export async function resolveShareToken(userId: string, token: string) {
  const link = await prisma.documentShareLink.findFirst({
    where: {
      tokenHash: hashToken(token),
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      docId: true,
      ownerId: true,
      canEdit: true,
    },
  });

  if (!link) {
    return null;
  }

  if (link.ownerId !== userId) {
    await prisma.documentCollaborator.upsert({
      where: {
        docId_userId: {
          docId: link.docId,
          userId,
        },
      },
      update: {
        role: link.canEdit ? "editor" : "viewer",
      },
      create: {
        docId: link.docId,
        userId,
        role: link.canEdit ? "editor" : "viewer",
      },
    });
  }

  return {
    docId: link.docId,
    canEdit: link.canEdit,
    ownerId: link.ownerId,
  };
}

