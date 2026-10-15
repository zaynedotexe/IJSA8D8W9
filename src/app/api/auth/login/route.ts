import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { buildAuthorizeUrl } from "@/lib/discord";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Discord login is not configured" }, { status: 503 });
  }
  const state = randomBytes(24).toString("hex");
  cookies().set("lonestar_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600
  });
  return NextResponse.redirect(buildAuthorizeUrl(state));
}
