import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  } catch {
    return null;
  }
}

export const prisma: PrismaClient | null = createClient();

export function dbAvailable(): boolean {
  return prisma !== null;
}

export async function safeDb<T>(fn: (db: PrismaClient) => Promise<T>, fallback: T): Promise<T> {
  if (!prisma) return fallback;
  try {
    return await fn(prisma);
  } catch {
    return fallback;
  }
}
