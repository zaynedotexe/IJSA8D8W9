import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";

export async function GET() {
  const session = await getSession();
  if (!session.discordId || !isAdminSession(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ degraded: true }, { status: 503 });
  try {
    const [homeViews, profileCount, memberCount, sync, recentProfiles] = await Promise.all([
      prisma.viewEvent.count({ where: { pageType: "home" } }),
      prisma.profile.count(),
      prisma.discordIdentity.count({ where: { isMember: true } }),
      prisma.syncState.findUnique({ where: { kind: "discord" } }),
      prisma.profile.findMany({ orderBy: { views: "desc" }, take: 10, include: { discordIdentity: true } })
    ]);
    return NextResponse.json({ homeViews, profileCount, memberCount, sync, topProfiles: recentProfiles });
  } catch {
    return NextResponse.json({ degraded: true }, { status: 503 });
  }
}
