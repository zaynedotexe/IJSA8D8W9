import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";
import { adminProfileSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.discordId) return null;
  if (!isAdminSession(session)) return null;
  return session;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ profiles: [], degraded: true });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  try {
    const profiles = await prisma.profile.findMany({
      include: { discordIdentity: true, affiliation: true },
      orderBy: { updatedAt: "desc" },
      take: 200
    });
    const filtered = q
      ? profiles.filter((p) => [p.discordId, p.identity, p.discordIdentity?.username || ""].join(" ").toLowerCase().includes(q))
      : profiles;
    return NextResponse.json({ profiles: filtered });
  } catch {
    return NextResponse.json({ profiles: [], degraded: true }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = adminProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  try {
    const identity = await prisma.discordIdentity.findUnique({ where: { discordId: parsed.data.discordId } });
    if (!identity) return NextResponse.json({ error: "Discord identity not found. User must log in or sync first." }, { status: 404 });
    const profile = await prisma.profile.upsert({
      where: { discordId: parsed.data.discordId },
      create: {
        discordId: parsed.data.discordId,
        identity: parsed.data.identity || "MEMBER",
        bio: parsed.data.bio || "",
        approved: parsed.data.approved ?? true,
        visible: parsed.data.visible ?? true,
        affiliationId: parsed.data.affiliationId || null
      },
      update: {
        identity: parsed.data.identity,
        bio: parsed.data.bio,
        approved: parsed.data.approved,
        visible: parsed.data.visible,
        affiliationId: parsed.data.affiliationId
      },
      include: { discordIdentity: true }
    });
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
