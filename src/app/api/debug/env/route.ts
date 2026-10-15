import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasClientId: Boolean(process.env.DISCORD_CLIENT_ID),
    clientIdLength: (process.env.DISCORD_CLIENT_ID || "").length,
    hasClientSecret: Boolean(process.env.DISCORD_CLIENT_SECRET),
    hasBotToken: Boolean(process.env.DISCORD_BOT_TOKEN),
    hasGuildId: Boolean(process.env.DISCORD_GUILD_ID),
    hasDatabase: Boolean(process.env.DATABASE_URL),
    hasSessionSecret: Boolean(process.env.SESSION_SECRET),
    hasAdminIds: Boolean(process.env.ADMIN_DISCORD_IDS),
    redirectUri: process.env.DISCORD_REDIRECT_URI || null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
    nodeEnv: process.env.NODE_ENV || null
  });
}
