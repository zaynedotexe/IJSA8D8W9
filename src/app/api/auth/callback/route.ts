import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { getSession } from "@/lib/session";
import { isAdminDiscordId } from "@/lib/authz";
import { avatarUrl, exchangeCode, fetchDiscordUser, fetchGuildMember, fetchUserGuilds } from "@/lib/discord";
import { prisma } from "@/lib/db";

function redirectWithClearedState(base: string, path: string) {
  const res = NextResponse.redirect(base + path);
  res.cookies.set("lonestar_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return res;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const base = getSiteUrl();
  if (error) return redirectWithClearedState(base, "/login?error=cancelled");
  const expected = req.headers.get("cookie")?.match(/(?:^|;\s*)lonestar_oauth_state=([^;]+)/)?.[1];
  const decoded = expected ? decodeURIComponent(expected) : undefined;
  if (!code || !state || !decoded || state !== decoded) {
    return redirectWithClearedState(base, "/login?error=invalid_state");
  }
  try {
    const token = await exchangeCode(code);
    const user = await fetchDiscordUser(token.access_token);
    const guilds = await fetchUserGuilds(token.access_token);
    const guildId = process.env.DISCORD_GUILD_ID || "";
    const isMember = guildId ? guilds.some((g) => g.id === guildId) : true;
    const avatar = avatarUrl(user.id, user.avatar);
    let nickname: string | null | undefined = undefined;
    let roleIds: string[] | undefined = undefined;
    const botToken = process.env.DISCORD_BOT_TOKEN || "";
    if (botToken && guildId) {
      try {
        const member = (await fetchGuildMember(botToken, guildId, user.id)) as {
          nick?: string | null;
          roles?: string[];
        } | null;
        if (member) {
          nickname = member.nick || null;
          roleIds = Array.isArray(member.roles) ? member.roles.filter((r) => r !== guildId) : [];
        }
      } catch {}
    }
    if (prisma) {
      try {
        const identityData = {
          username: user.username,
          globalName: user.global_name,
          avatar,
          isMember,
          lastSyncAt: new Date(),
          ...(nickname !== undefined ? { nickname } : {}),
          ...(roleIds !== undefined ? { roleIds } : {})
        };
        await prisma.discordIdentity.upsert({
          where: { discordId: user.id },
          create: {
            discordId: user.id,
            nickname: nickname ?? null,
            roleIds: roleIds ?? [],
            ...identityData
          },
          update: identityData
        });
      } catch {}
    }
    const session = await getSession();
    session.discordId = user.id;
    session.username = user.username;
    session.globalName = user.global_name || undefined;
    session.avatar = avatar || undefined;
    session.isAdmin = isAdminDiscordId(user.id);
    session.expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    await session.save();
    if (!isMember) return redirectWithClearedState(base, "/login?error=not_member");
    return redirectWithClearedState(base, "/me");
  } catch {
    return redirectWithClearedState(base, "/login?error=oauth_failed");
  }
}
