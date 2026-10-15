import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";
import { roleConfigSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.discordId) return null;
  if (!isAdminSession(session)) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ roles: [], degraded: true });
  try {
    const roles = await prisma.roleConfig.findMany({ orderBy: { priority: "asc" } });
    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json({ roles: [], degraded: true }, { status: 503 });
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
  const parsed = roleConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const role = await prisma.roleConfig.upsert({
      where: { roleId: parsed.data.roleId },
      create: {
        roleId: parsed.data.roleId,
        name: parsed.data.name,
        priority: parsed.data.priority ?? 100,
        visible: parsed.data.visible ?? true,
        style: parsed.data.style || null
      },
      update: {
        name: parsed.data.name,
        priority: parsed.data.priority,
        visible: parsed.data.visible,
        style: parsed.data.style
      }
    });
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
