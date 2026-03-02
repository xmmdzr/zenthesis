import { prisma } from "@/lib/db";
import type { UsageQuota } from "@/lib/types";

const DEFAULT_LIMIT = 600;
const usageStore = new Map<string, UsageQuota>();

function periodKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function mapQuota(row: {
  userId: string;
  period: string;
  monthlyLimit: number;
  consumed: number;
}): UsageQuota {
  return {
    userId: row.userId,
    period: row.period,
    monthlyLimit: row.monthlyLimit,
    consumed: row.consumed,
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

export async function getUsageQuota(userId: string): Promise<UsageQuota> {
  const key = `${userId}:${periodKey()}`;

  try {
    await ensureUser(userId);
    const row = await prisma.usageQuota.upsert({
      where: {
        userId_period: {
          userId,
          period: periodKey(),
        },
      },
      update: {},
      create: {
        userId,
        period: periodKey(),
        monthlyLimit: DEFAULT_LIMIT,
        consumed: 0,
      },
    });

    return mapQuota(row);
  } catch {
    const existing = usageStore.get(key);
    if (existing) {
      return existing;
    }

    const created: UsageQuota = {
      userId,
      period: periodKey(),
      monthlyLimit: DEFAULT_LIMIT,
      consumed: 0,
    };

    usageStore.set(key, created);
    return created;
  }
}

export async function consumeUsage(userId: string, units: number): Promise<UsageQuota> {
  try {
    await ensureUser(userId);
    const row = await prisma.usageQuota.upsert({
      where: {
        userId_period: {
          userId,
          period: periodKey(),
        },
      },
      update: {
        consumed: {
          increment: Math.max(0, units),
        },
      },
      create: {
        userId,
        period: periodKey(),
        monthlyLimit: DEFAULT_LIMIT,
        consumed: Math.max(0, units),
      },
    });

    if (row.consumed > row.monthlyLimit) {
      const capped = await prisma.usageQuota.update({
        where: { id: row.id },
        data: { consumed: row.monthlyLimit },
      });
      return mapQuota(capped);
    }

    return mapQuota(row);
  } catch {
    const key = `${userId}:${periodKey()}`;
    const quota = await getUsageQuota(userId);
    quota.consumed = Math.min(quota.monthlyLimit, quota.consumed + Math.max(0, units));
    usageStore.set(key, quota);
    return quota;
  }
}
