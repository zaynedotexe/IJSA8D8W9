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
    } | null;
  };
  return {
    id: row.id,
    discordId: row.discordId,
    identity: row.identity,
    bio: row.bio,
    backgroundUrl: row.backgroundUrl,
    musicUrl: row.musicUrl,
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
    roleIds: row.discordIdentity?.roleIds || []
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
    const roles = await prisma.roleConfig.findMany({
      where: { roleId: { in: profile.discordIdentity?.roleIds || [] }, visible: true }
    });
    return NextResponse.json({ profile: publicShape(profile as never), roles });
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
        musicUrl: data.musicUrl !== undefined ? (data.musicUrl === "" ? null : data.musicUrl) : undefined,
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
