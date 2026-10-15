import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canEditProfile } from "@/lib/authz";
import { profileUpdateSchema } from "@/lib/validation";

function publicShape(p: never): Record<string, unknown> {
  const row = p as unknown as {
    id: string;
    discordId: string;
    identity: string;
    bio: string;
    backgroundUrl: string | null;
    musicUrl: string | null;
    trackTitle: string | null;
    trackArtist: string | null;
    trackCover: string | null;
    glowColor: string | null;
    location: string | null;
    timezone: string | null;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    affiliation: unknown;
    discordIdentity: {
      username: string;
      globalName: string | null;
      avatar: string | null;
      nickname: string | null;
      roleIds: string[];
      isMember: boolean;
      flags: number;
      premiumType: number | null;
      boosting: boolean;
    } | null;
  };
  return {
    id: row.id,
    discordId: row.discordId,
    identity: row.identity,
    bio: row.bio,
    backgroundUrl: row.backgroundUrl,
    musicUrl: row.musicUrl,
    trackTitle: row.trackTitle,
    trackArtist: row.trackArtist,
    trackCover: row.trackCover,
    glowColor: row.glowColor,
    location: row.location,
    timezone: row.timezone,
    views: row.views,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    affiliation: row.affiliation,
    username: row.discordIdentity?.username || null,
    globalName: row.discordIdentity?.globalName || null,
    avatar: row.discordIdentity?.avatar || null,
    nickname: row.discordIdentity?.nickname || null,
    roleIds: row.discordIdentity?.roleIds || [],
    flags: row.discordIdentity?.flags ?? 0,
    premiumType: row.discordIdentity?.premiumType ?? null,
    boosting: row.discordIdentity?.boosting ?? false
  };
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: ctx.params.id, visible: true, approved: true },
      include: { discordIdentity: true, affiliation: true }
    });
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [roles, allAffiliations] = await Promise.all([
      prisma.roleConfig.findMany({
        where: { roleId: { in: profile.discordIdentity?.roleIds || [] }, visible: true }
      }),
      prisma.affiliation.findMany({ where: { visible: true }, orderBy: { order: "asc" } })
    ]);
    const memberGuilds = profile.discordIdentity?.guildIds || [];
    const servers = allAffiliations
      .filter((a) => a.discordGuildId)
      .map((a) => ({
        id: a.id,
        name: a.name,
        logoUrl: a.logoUrl,
        externalUrl: a.externalUrl,
        isMember: memberGuilds.includes(a.discordGuildId as string)
      }));
    return NextResponse.json({ profile: publicShape(profile as never), roles, servers });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getSession();
  if (!session.discordId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  try {
    const existing = await prisma.profile.findUnique({
      where: { id: ctx.params.id },
      include: { discordIdentity: true }
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.discordId !== session.discordId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const member = existing.discordIdentity?.isMember ?? false;
    if (!canEditProfile(session, existing.discordId, member)) {
      return NextResponse.json({ error: "Membership required" }, { status: 403 });
    }
    const data = parsed.data;
    const updated = await prisma.profile.update({
      where: { id: ctx.params.id },
      data: {
        bio: data.bio !== undefined ? data.bio.slice(0, 500) : undefined,
        backgroundUrl: data.backgroundUrl !== undefined ? (data.backgroundUrl === "" ? null : data.backgroundUrl) : undefined,
        glowColor: data.glowColor !== undefined ? (data.glowColor.trim() === "" ? null : data.glowColor.trim().slice(0, 7)) : undefined,
        location: data.location !== undefined ? (data.location === "" ? null : data.location.slice(0, 120)) : undefined,
        timezone: data.timezone !== undefined ? (data.timezone === "" ? null : data.timezone.slice(0, 80)) : undefined
      },
      include: { discordIdentity: true, affiliation: true }
    });
    return NextResponse.json({ profile: publicShape(updated as never) });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
