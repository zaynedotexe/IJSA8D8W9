import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl } from "@/lib/env";
import { getSession } from "@/lib/session";
import { isAdminDiscordId } from "@/lib/authz";
import { avatarUrl, exchangeCode, fetchDiscordUser, fetchUserGuilds } from "@/lib/discord";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const base = getSiteUrl();
  if (error) return NextResponse.redirect(base + "/login?error=cancelled");
  const expected = cookies().get("lonestar_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(base + "/login?error=invalid_state");
  }
  cookies().set("lonestar_oauth_state", "", { path: "/", maxAge: 0 });
  try {
    const token = await exchangeCode(code);
    const user = await fetchDiscordUser(token.access_token);
    const guilds = await fetchUserGuilds(token.access_token);
    const guildId = process.env.DISCORD_GUILD_ID || "";
    const isMember = guildId ? guilds.some((g) => g.id === guildId) : true;
    const avatar = avatarUrl(user.id, user.avatar);
    if (prisma) {
      try {
        await prisma.discordIdentity.upsert({
          where: { discordId: user.id },
          create: {
            discordId: user.id,
            username: user.username,
            globalName: user.global_name,
            avatar,
            isMember,
            lastSyncAt: new Date()
          },
          update: {
            username: user.username,
            globalName: user.global_name,
            avatar,
            isMember,
            lastSyncAt: new Date()
          }
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
    if (!isMember) return NextResponse.redirect(base + "/login?error=not_member");
    return NextResponse.redirect(base + "/me");
  } catch {
    return NextResponse.redirect(base + "/login?error=oauth_failed");
  }
}
