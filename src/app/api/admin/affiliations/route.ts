import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/authz";
import { affiliationSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await getSession();
  if (!session.discordId) return null;
  if (!isAdminSession(session)) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ affiliations: [], degraded: true });
  try {
    const affiliations = await prisma.affiliation.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ affiliations });
  } catch {
    return NextResponse.json({ affiliations: [], degraded: true }, { status: 503 });
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
  const parsed = affiliationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const created = await prisma.affiliation.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || "",
        logoUrl: parsed.data.logoUrl || null,
        externalUrl: parsed.data.externalUrl || null,
        category: parsed.data.category || null,
        order: parsed.data.order ?? 0,
        visible: parsed.data.visible ?? true
      }
    });
    return NextResponse.json({ affiliation: created });
  } catch {
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
