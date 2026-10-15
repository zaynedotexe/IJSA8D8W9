import { NextResponse } from "next/server";
import { getSession, isSessionExpired } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.discordId || isSessionExpired(session)) {
    return NextResponse.json({ authenticated: false, user: null, profileId: null });
  }
  let profileId: string | null = null;
  let isMember = true;
  if (prisma) {
    try {
      const [profile, identity] = await Promise.all([
        prisma.profile.findUnique({ where: { discordId: session.discordId }, select: { id: true } }),
        prisma.discordIdentity.findUnique({ where: { discordId: session.discordId }, select: { isMember: true } })
      ]);
      if (profile) profileId = profile.id;
      if (identity) isMember = identity.isMember;
    } catch {}
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      discordId: session.discordId,
      username: session.username,
      globalName: session.globalName,
      avatar: session.avatar,
      isAdmin: session.isAdmin
    },
    profileId,
    isMember
  });
}
