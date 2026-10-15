export function getEnv(name: string, fallback = ""): string {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return value;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error("Missing environment variable: " + name);
  return value;
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_CLIENT_ID &&
      process.env.DISCORD_CLIENT_SECRET &&
      process.env.DISCORD_GUILD_ID &&
      process.env.DATABASE_URL &&
      process.env.SESSION_SECRET
  );
}

export function getAdminIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL;
  return "http://localhost:3000";
}
