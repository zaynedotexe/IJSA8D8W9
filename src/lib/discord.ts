import { getEnv, getSiteUrl } from "./env";

export const DISCORD_API = "https://discord.com/api/v10";

export function getRedirectUri(): string {
  const configured = getEnv("DISCORD_REDIRECT_URI", "");
  if (configured) return configured;
  return getSiteUrl() + "/api/auth/callback";
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = getEnv("DISCORD_CLIENT_ID", "");
  const redirect = encodeURIComponent(getRedirectUri());
  const params = [
    "client_id=" + encodeURIComponent(clientId),
    "redirect_uri=" + redirect,
    "response_type=code",
    "scope=" + encodeURIComponent("identify guilds"),
    "state=" + encodeURIComponent(state),
    "prompt=consent"
  ].join("&");
  return DISCORD_API + "/oauth2/authorize?" + params;
}

export type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

export async function exchangeCode(code: string): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: getEnv("DISCORD_CLIENT_ID", ""),
    client_secret: getEnv("DISCORD_CLIENT_SECRET", ""),
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri()
  });
  const res = await fetch(DISCORD_API + "/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!res.ok) throw new Error("Token exchange failed");
  return (await res.json()) as DiscordTokenResponse;
}

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(DISCORD_API + "/users/@me", {
    headers: { Authorization: "Bearer " + accessToken }
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return (await res.json()) as DiscordUser;
}

export type DiscordGuild = { id: string; name: string };

export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(DISCORD_API + "/users/@me/guilds", {
    headers: { Authorization: "Bearer " + accessToken }
  });
  if (!res.ok) return [];
  return (await res.json()) as DiscordGuild[];
}

export function avatarUrl(userId: string, avatar: string | null): string | null {
  if (!avatar) return null;
  const ext = avatar.startsWith("a_") ? "gif" : "png";
  return "https://cdn.discordapp.com/avatars/" + userId + "/" + avatar + "." + ext + "?size=256";
}

export async function fetchGuildMember(botToken: string, guildId: string, userId: string) {
  const res = await fetch(DISCORD_API + "/guilds/" + guildId + "/members/" + userId, {
    headers: { Authorization: "Bot " + botToken }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Guild member lookup failed");
  return await res.json();
}
