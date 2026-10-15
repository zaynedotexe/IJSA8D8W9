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

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = adminProfileSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const updated = await prisma.profile.update({
      where: { id: ctx.params.id },
      data: {
        identity: parsed.data.identity,
        bio: parsed.data.bio,
        approved: parsed.data.approved,
        visible: parsed.data.visible,
        affiliationId: parsed.data.affiliationId === undefined ? undefined : parsed.data.affiliationId
      }
    });
    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await prisma.profile.delete({ where: { id: ctx.params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
