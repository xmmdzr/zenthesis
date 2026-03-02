import { prisma } from "@/lib/db";

const USERNAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9_]{6,10}$/;

let backfillPromise: Promise<void> | null = null;

function randomSuffix(length = 4) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
}

function toUsernameCandidate(seed: string) {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 10);

  let candidate = normalized;
  if (!/[a-z]/.test(candidate)) {
    candidate = `u${candidate}`;
  }

  if (candidate.length < 6) {
    candidate = `${candidate}${randomSuffix(6 - candidate.length)}`;
  }

  if (candidate.length > 10) {
    candidate = candidate.slice(0, 10);
  }

  if (!USERNAME_REGEX.test(candidate)) {
    candidate = `user${randomSuffix(6)}`.slice(0, 10);
  }

  return candidate;
}

async function ensureUniqueUsername(base: string) {
  let candidate = base;
  let attempt = 0;

  while (attempt < 20) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    const suffix = randomSuffix(2 + Math.min(3, attempt));
    const nextBase = base.slice(0, Math.max(1, 10 - suffix.length));
    candidate = `${nextBase}${suffix}`.slice(0, 10);
    if (!/[a-z]/.test(candidate)) {
      candidate = `u${candidate}`.slice(0, 10);
    }
    attempt += 1;
  }

  return `user${randomSuffix(6)}`.slice(0, 10);
}

export async function ensureStartupBackfill() {
  if (backfillPromise) {
    return backfillPromise;
  }

  backfillPromise = (async () => {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: null }, { username: "" }],
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    for (const user of users) {
      const seed = user.name?.trim() || user.email.split("@")[0] || "user";
      const uniqueUsername = await ensureUniqueUsername(toUsernameCandidate(seed));
      await prisma.user.update({
        where: { id: user.id },
        data: { username: uniqueUsername },
      });
    }

  })().catch((error) => {
    backfillPromise = null;
    throw error;
  });

  return backfillPromise;
}

export function isValidUsername(username: string) {
  return USERNAME_REGEX.test(username);
}
