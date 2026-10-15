import { getAdminIds } from "./env";
import type { SessionData } from "./session";

export function isAdminDiscordId(discordId: string | undefined): boolean {
  if (!discordId) return false;
  return getAdminIds().includes(discordId);
}

export function isAdminSession(session: SessionData): boolean {
  if (session.isAdmin) return true;
  return isAdminDiscordId(session.discordId);
}

export function canEditProfile(session: SessionData, profileDiscordId: string, isMember: boolean): boolean {
  if (!session.discordId) return false;
  if (session.discordId !== profileDiscordId) return false;
  if (isAdminSession(session)) return true;
  return isMember;
}
