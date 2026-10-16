import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncPayloadSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const secret = process.env.BOT_SHARED_SECRET;
  if (!secret) return NextResponse.json({ error: "Sync not configured" }, { status: 503 });
  const provided = req.headers.get("x-bot-secret");
  if (!provided || provided !== secret) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!prisma) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const items = Array.isArray(body) ? body : [body];
  try {
    for (const item of items) {
      const parsed = syncPayloadSchema.safeParse(item);
      if (!parsed.success) continue;
      const d = parsed.data;
      let joinedAt: Date | undefined = undefined;
      if (d.joinedAt) {
        const t = new Date(d.joinedAt);
        if (!Number.isNaN(t.getTime())) joinedAt = t;
      }
      await prisma.discordIdentity.upsert({
        where: { discordId: d.discordId },
        create: {
          discordId: d.discordId,
          username: d.username,
          globalName: d.globalName || null,
          avatar: d.avatar || null,
          nickname: d.nickname || null,
          roleIds: d.roleIds || [],
          isMember: d.isMember ?? true,
          joinedAt: joinedAt || null,
          lastSyncAt: new Date()
        },
        update: {
          username: d.username,
          globalName: d.globalName || null,
          avatar: d.avatar || null,
          nickname: d.nickname || null,
          roleIds: d.roleIds || [],
          status: d.status || undefined,
          isMember: d.isMember ?? true,
          joinedAt: joinedAt || undefined,
          lastSyncAt: new Date()
        }
      });
      if (d.roles) {
        for (const r of d.roles) {
          try {
            await prisma.roleConfig.upsert({
              where: { roleId: r.id },
              create: {
                roleId: r.id,
                name: r.name.slice(0, 120),
                priority: 100,
                visible: false,
                icon: r.icon || null,
                unicodeEmoji: r.unicodeEmoji || null
              },
              update: {
                name: r.name.slice(0, 120),
                icon: r.icon || null,
                unicodeEmoji: r.unicodeEmoji || null
              }
            });
          } catch {}
        }
      }
    }
    await prisma.syncState.upsert({
      where: { kind: "discord" },
      create: { kind: "discord", status: "ok", lastRunAt: new Date() },
      update: { status: "ok", lastRunAt: new Date(), detail: null }
    });
    return NextResponse.json({ ok: true, processed: items.length });
  } catch {
    try {
      await prisma.syncState.upsert({
        where: { kind: "discord" },
        create: { kind: "discord", status: "error", lastRunAt: new Date() },
        update: { status: "error", lastRunAt: new Date() }
      });
    } catch {}
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET() {
  if (!prisma) return NextResponse.json({ status: "unknown", degraded: true });
  try {
    const state = await prisma.syncState.findUnique({ where: { kind: "discord" } });
    return NextResponse.json({ status: state?.status || "never", lastRunAt: state?.lastRunAt || null });
  } catch {
    return NextResponse.json({ status: "unknown", degraded: true });
  }
}
