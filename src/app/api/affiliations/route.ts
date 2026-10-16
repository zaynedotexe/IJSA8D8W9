import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SEED_AFFILIATIONS } from "@/lib/site";

function clean<T extends { logoUrl?: string | null }>(a: T): T {
  if (a.logoUrl && a.logoUrl.startsWith("/aff-")) return { ...a, logoUrl: a.logoUrl.replace("/aff-", "/ally-") };
  return a;
}

export async function GET() {
  if (!prisma) return NextResponse.json({ affiliations: SEED_AFFILIATIONS.map(clean), degraded: true });
  try {
    const affiliations = await prisma.affiliation.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ affiliations: affiliations.map(clean) });
  } catch {
    return NextResponse.json({ affiliations: SEED_AFFILIATIONS.map(clean), degraded: true });
  }
}
