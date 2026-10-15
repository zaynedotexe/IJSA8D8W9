import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";

function tierOf(name: string): { priority: number; visible: boolean; label: string } {
  const lower = name.toLowerCase();
  if (lower === "founder") return { priority: 0, visible: true, label: "Founder" };
  if (lower.includes("godly")) return { priority: 10, visible: true, label: "Godly Sins" };
  if (lower === "sins" || lower === "ѕιηѕ") return { priority: 50, visible: true, label: "Sins" };
  if (lower === "shits" || lower === "ѕнιтѕ") return { priority: 100, visible: true, label: "Shits" };
  return { priority: 100, visible: false, label: name.slice(0, 120) };
}

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
    const live = roles.filter((r) => r.id !== guildId);
    const artwork: string[] = [];
    for (const r of live) {
      const tier = tierOf(r.name);
      try {
        await prisma.roleConfig.upsert({
          where: { roleId: r.id },
          create: {
            roleId: r.id,
            name: tier.label,
            priority: tier.priority,
            visible: tier.visible,
            icon: r.icon,
            unicodeEmoji: r.unicode_emoji
          },
          update: {
            name: tier.label,
            priority: tier.priority,
            visible: tier.visible,
            icon: r.icon,
            unicodeEmoji: r.unicode_emoji
          }
        });
        if (r.icon || r.unicode_emoji) artwork.push(r.name);
      } catch {}
    }
    const pruned = await prisma.roleConfig.deleteMany({
      where: { roleId: { notIn: live.map((r) => r.id) } }
    });
    return NextResponse.json({ upserted: live.length, pruned: pruned.count, artwork });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
