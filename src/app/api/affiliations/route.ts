import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SEED_AFFILIATIONS } from "@/lib/site";

export async function GET() {
  if (!prisma) return NextResponse.json({ affiliations: SEED_AFFILIATIONS, degraded: true });
  try {
    const affiliations = await prisma.affiliation.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ affiliations });
  } catch {
    return NextResponse.json({ affiliations: SEED_AFFILIATIONS, degraded: true });
  }
}
