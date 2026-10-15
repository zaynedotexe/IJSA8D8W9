import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, dedupKey } from "@/lib/rate-limit";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ count: 0, degraded: true });
  try {
    const profile = await prisma.profile.findUnique({ where: { id: ctx.params.id }, select: { views: true } });
    return NextResponse.json({ count: profile?.views ?? 0 });
  } catch {
    return NextResponse.json({ count: 0, degraded: true });
  }
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const limit = await checkRateLimit(req, "views-profile", 60, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  if (!prisma) return NextResponse.json({ count: 0, degraded: true });
  try {
    const profile = await prisma.profile.findUnique({ where: { id: ctx.params.id }, select: { id: true } });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const hash = dedupKey(req, "profile|" + ctx.params.id + "|" + new Date().toISOString().slice(0, 13));
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const dup = await prisma.viewEvent.findFirst({
      where: { pageType: "profile", profileId: ctx.params.id, dedupHash: hash, createdAt: { gte: since } }
    });
    if (!dup) {
      await prisma.viewEvent.create({ data: { pageType: "profile", profileId: ctx.params.id, dedupHash: hash } });
      await prisma.profile.update({ where: { id: ctx.params.id }, data: { views: { increment: 1 } } });
    }
    const fresh = await prisma.profile.findUnique({ where: { id: ctx.params.id }, select: { views: true } });
    return NextResponse.json({ count: fresh?.views ?? 0 });
  } catch {
    return NextResponse.json({ count: 0, degraded: true }, { status: 503 });
  }
}
