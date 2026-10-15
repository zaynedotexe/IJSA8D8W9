import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID || "";
  const guildId = process.env.DISCORD_GUILD_ID || "";
  const adminIds = process.env.ADMIN_DISCORD_IDS || "";
  const db = process.env.DATABASE_URL || "";
  const bot = process.env.DISCORD_BOT_TOKEN || "";
  const secret = process.env.DISCORD_CLIENT_SECRET || "";
  const session = process.env.SESSION_SECRET || "";
  const botSecret = process.env.BOT_SHARED_SECRET || "";
  const redirectUri = process.env.DISCORD_REDIRECT_URI || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  let redirectOk = false;
  try {
    const u = new URL(redirectUri);
    redirectOk = u.protocol === "https:" && u.pathname === "/api/auth/callback";
  } catch {}
  return NextResponse.json({
    clientId: clientId === "" ? "missing" : (/^\d{17,20}$/.test(clientId) ? "ok" : "bad_format"),
    clientSecret: secret === "" ? "missing" : (secret.length >= 20 ? "present" : "too_short"),
    botToken: bot === "" ? "missing" : (bot.split(".").length === 3 ? "ok" : "bad_format"),
    guildId: guildId === "" ? "missing" : (/^\d{17,20}$/.test(guildId) ? "ok" : "bad_format"),
    adminIds: adminIds === "" ? "missing" : (adminIds.split(",").every((s) => /^\d{17,20}$/.test(s.trim())) ? "ok" : "bad_format"),
    database: db === "" ? "missing" : (db.startsWith("postgresql://") ? "ok" : "bad_format"),
    sessionSecret: session === "" ? "missing" : (session.length >= 32 ? "ok" : "too_short"),
    botSharedSecret: botSecret === "" ? "missing" : (botSecret.length >= 16 ? "ok" : "too_short"),
    redirectUri: redirectUri === "" ? "missing" : (redirectOk ? "ok" : "bad_format"),
    siteUrl: siteUrl === "" ? "missing" : (siteUrl.startsWith("https://") ? "ok" : "bad_format")
  });
}
