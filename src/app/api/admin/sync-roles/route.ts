import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";

export async function GET() {
  const session = await getSession();
  if (!session.discordId || !isAdminSession(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const botToken = process.env.DISCORD_BOT_TOKEN || "";
  const guildId = process.env.DISCORD_GUILD_ID || "";
  if (!botToken || !guildId || !prisma) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  try {
    const res = await fetch("https://discord.com/api/v10/guilds/" + guildId + "/roles", {
      headers: { Authorization: "Bot " + botToken }
    });
    if (!res.ok) return NextResponse.json({ error: "Discord rejected the bot token", status: res.status }, { status: 502 });
    const roles = (await res.json()) as { id: string; name: string; icon: string | null; unicode_emoji: string | null }[];
    let guildName: string | null = null;
    try {
      const g = await fetch("https://discord.com/api/v10/guilds/" + guildId + "?with_counts=true", {
        headers: { Authorization: "Bot " + botToken }
      });
      if (g.ok) {
        const gj = (await g.json()) as { name?: string };
        guildName = gj.name || null;
      }
    } catch {}
    let updated = 0;
    const artwork: string[] = [];
    for (const r of roles) {
      if (r.id === guildId) continue;
      try {
        const hit = await prisma.roleConfig.updateMany({
          where: { roleId: r.id },
          data: { name: r.name.slice(0, 120), icon: r.icon, unicodeEmoji: r.unicode_emoji }
        });
        if (hit.count > 0) {
          updated += 1;
          if (r.icon || r.unicode_emoji) artwork.push(r.name);
        }
      } catch {}
    }
    return NextResponse.json({
      updated,
      artwork,
      guildName,
      guildId,
      serverRoleCount: roles.length,
      serverRoleSample: roles.slice(0, 8).map((r) => ({ id: r.id, name: r.name }))
    });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
