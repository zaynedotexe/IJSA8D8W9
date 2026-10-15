import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  discordId?: string;
  username?: string;
  globalName?: string;
  avatar?: string;
  isAdmin?: boolean;
  expiresAt?: number;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET || "lonestar-dev-secret-0123456789abcdef";
  return {
    cookieName: "lonestar_session",
    password,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    }
  };
}

export async function getSession() {
  const store = cookies();
  return getIronSession<SessionData>(store as never, sessionOptions());
}

export function isSessionExpired(data: SessionData): boolean {
  if (!data.discordId) return true;
  if (!data.expiresAt) return true;
  return Date.now() > data.expiresAt;
}
