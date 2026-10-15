import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { roleId: "100000000000000001", name: "FOUNDER", priority: 0, visible: true, style: "founder" },
    { roleId: "100000000000000002", name: "COUNCIL", priority: 10, visible: true, style: "council" },
    { roleId: "100000000000000003", name: "MEMBER", priority: 50, visible: true, style: "member" }
  ];
  for (const r of roles) {
    await prisma.roleConfig.upsert({ where: { roleId: r.roleId }, create: r, update: { name: r.name, priority: r.priority } });
  }
  const affs = [
    { name: "Lannister", description: "Allied collective standing with Lonestar.", category: "AFFILIATE", order: 0, visible: true },
    { name: "Celestia", description: "Allied community in orbit with Lonestar.", category: "AFFILIATE", order: 1, visible: true }
  ];
  for (const a of affs) {
    const existing = await prisma.affiliation.findFirst({ where: { name: a.name } });
    if (!existing) await prisma.affiliation.create({ data: a });
  }
  await prisma.syncState.upsert({
    where: { kind: "discord" },
    create: { kind: "discord", status: "seeded" },
    update: { status: "seeded" }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(() => prisma.$disconnect());
