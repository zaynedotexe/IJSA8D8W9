import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!prisma) return NextResponse.json({ roles: [], degraded: true });
  try {
    const roles = await prisma.roleConfig.findMany({ where: { visible: true }, orderBy: { priority: "asc" } });
    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json({ roles: [], degraded: true });
  }
}
