import { createHash, randomUUID } from "node:crypto";

import { prisma } from "@/lib/db";

export const SESSION_COOKIE_NAME = "zenthesis_session";
const SESSION_DAYS = 14;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookie(header: string | null, key: string): string | null {
  if (!header) {
    return null;
  }

  const parts = header.split(";");
  for (const part of parts) {
    const [cookieKey, ...rest] = part.trim().split("=");
    if (cookieKey === key) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function getSessionUserIdFromRequest(request: Request): Promise<string | null> {
  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = await prisma.userSession.findUnique({
    where: { token: tokenHash },
    select: {
      userId: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.delete({ where: { token: tokenHash } }).catch(() => undefined);
    return null;
  }

  return session.userId;
}

export async function clearSessionFromRequest(request: Request) {
  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);
  await prisma.userSession.delete({ where: { token: tokenHash } }).catch(() => undefined);
}
