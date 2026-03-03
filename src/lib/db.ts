import { PrismaClient } from "@prisma/client";

declare global {
  var __zenthesisPrisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required. Configure a PostgreSQL connection string (e.g. Supabase Postgres) in environment variables.",
  );
}

export const prisma =
  global.__zenthesisPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__zenthesisPrisma = prisma;
}
