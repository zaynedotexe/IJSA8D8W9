import { createHash } from "crypto";
import { prisma } from "./db";

type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "unknown";
  const ua = req.headers.get("user-agent") || "";
  const raw = ip + "|" + ua.slice(0, 80);
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export function dedupKey(req: Request, salt: string): string {
  return createHash("sha256").update(clientKey(req) + "|" + salt).digest("hex");
}

export async function checkRateLimit(req: Request, scope: string, limit: number, windowMs: number): Promise<{ ok: boolean; remaining: number }> {
  const key = scope + ":" + clientKey(req);
  const now = Date.now();
  if (!prisma) {
    const hit = memory.get(key);
    if (!hit || hit.resetAt < now) {
      memory.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: limit - 1 };
    }
    if (hit.count >= limit) return { ok: false, remaining: 0 };
    hit.count += 1;
    return { ok: true, remaining: limit - hit.count };
  }
  try {
    const existing = await prisma.rateLimitEntry.findUnique({ where: { key } });
    if (!existing || existing.expiresAt.getTime() < now) {
      await prisma.rateLimitEntry.upsert({
        where: { key },
        create: { key, count: 1, expiresAt: new Date(now + windowMs) },
        update: { count: 1, expiresAt: new Date(now + windowMs) }
      });
      return { ok: true, remaining: limit - 1 };
    }
    if (existing.count >= limit) return { ok: false, remaining: 0 };
    await prisma.rateLimitEntry.update({ where: { key }, data: { count: existing.count + 1 } });
    return { ok: true, remaining: limit - existing.count - 1 };
  } catch {
    return { ok: true, remaining: limit - 1 };
  }
}
