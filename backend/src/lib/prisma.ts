import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton.
 *
 * In development, hot-reloading can instantiate multiple PrismaClient instances,
 * exhausting the database connection pool. This singleton pattern prevents that.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
