import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = (url.searchParams.get("search") || "").toLowerCase().trim();
  const role = url.searchParams.get("role") || "";
  const affiliation = url.searchParams.get("affiliation") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get("limit") || "24", 10) || 24));
  if (!prisma) return NextResponse.json({ members: [], total: 0, page, totalPages: 0, degraded: true });
  try {
    const [roles, profiles] = await Promise.all([
      prisma.roleConfig.findMany({ where: { visible: true } }),
      prisma.profile.findMany({
        where: {
          visible: true,
          approved: true,
          ...(affiliation ? { affiliationId: affiliation } : {})
        },
        include: {
          discordIdentity: true,
          affiliation: true
        }
      })
    ]);
    const priorityOf = new Map(roles.map((r) => [r.roleId, r.priority]));
    const roleById = new Map(roles.map((r) => [r.roleId, r]));
    let rows = profiles.filter((p) => p.discordIdentity && p.discordIdentity.isMember);
    if (search) {
      rows = rows.filter((p) => {
        const id = p.discordIdentity!;
        const hay = [id.username, id.globalName || "", id.nickname || "", p.identity].join(" ").toLowerCase();
        return hay.includes(search);
      });
    }
    if (role) {
      const exact = roles.find((r) => r.roleId === role);
      const accepted = exact
        ? [role]
        : roles.filter((r) => r.name.toLowerCase() === role.toLowerCase()).map((r) => r.roleId);
      rows = rows.filter((p) => (p.discordIdentity?.roleIds || []).some((rid) => accepted.includes(rid)));
    }
    const mapped = rows.map((p) => {
      const id = p.discordIdentity!;
      const rids = (id.roleIds || []).filter((rid) => roleById.has(rid));
      const pri = rids.length ? Math.min(...rids.map((rid) => priorityOf.get(rid) ?? 9999)) : 9999;
      return {
        id: p.id,
        discordId: p.discordId,
        identity: p.identity,
        bio: p.bio,
        backgroundUrl: p.backgroundUrl,
        glowColor: p.glowColor,
        username: id.username,
        globalName: id.globalName,
        avatar: id.avatar,
        nickname: id.nickname,
        roleIds: rids,
        roles: rids.map((rid) => roleById.get(rid)!),
        affiliation: p.affiliation,
        priority: pri
      };
    });
    mapped.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.username.localeCompare(b.username);
    });
    const total = mapped.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const members = mapped.slice(start, start + limit);
    return NextResponse.json({ members, total, page, totalPages });
  } catch {
    return NextResponse.json({ members: [], total: 0, page, totalPages: 0, degraded: true }, { status: 503 });
  }
}
