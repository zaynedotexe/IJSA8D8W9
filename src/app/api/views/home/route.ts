import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, dedupKey } from "@/lib/rate-limit";

export async function GET() {
  if (!prisma) return NextResponse.json({ count: 0, degraded: true });
  try {
    const count = await prisma.viewEvent.count({ where: { pageType: "home" } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0, degraded: true });
  }
}

export async function POST(req: Request) {
  const limit = await checkRateLimit(req, "views-home", 30, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  if (!prisma) return NextResponse.json({ count: 0, degraded: true });
  try {
    const hash = dedupKey(req, "home|" + new Date().toISOString().slice(0, 13));
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const dup = await prisma.viewEvent.findFirst({ where: { pageType: "home", dedupHash: hash, createdAt: { gte: since } } });
    if (!dup) {
      await prisma.viewEvent.create({ data: { pageType: "home", dedupHash: hash } });
    }
    const count = await prisma.viewEvent.count({ where: { pageType: "home" } });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0, degraded: true }, { status: 503 });
  }
}
