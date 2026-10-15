import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { roleId: "575999868804399119", name: "Founder", priority: 0, visible: true, style: "founder" },
    { roleId: "641532736024215553", name: "Godly Sins", priority: 10, visible: true, style: "godly" },
    { roleId: "863299682045132800", name: "Godly Sins", priority: 10, visible: true, style: "godly" },
    { roleId: "746710459859861524", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "744471375208775722", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "1254411720651444329", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "453997598077091842", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "976341248984100915", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "1492135484133212171", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "776121152299991061", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "996787931974996129", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "266175988474314752", name: "Sins", priority: 50, visible: true, style: "sins" },
    { roleId: "601422235948941312", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "1131068291700490330", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "882588461729710110", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "1361250431761907913", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "737527418809745558", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "706081918613061642", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "1378446040516137001", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "941726919068647425", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "709422905045417985", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "792008961419116574", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "1331922060548767776", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "666622888325021698", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "884392115164049428", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "681133772879822860", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "746277288026439740", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "972806039349100585", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "702890974250008656", name: "Shits", priority: 100, visible: true, style: "shits" },
    { roleId: "718380350404821042", name: "Shits", priority: 100, visible: true, style: "shits" }
  ];
  for (const r of roles) {
    await prisma.roleConfig.upsert({ where: { roleId: r.roleId }, create: r, update: { name: r.name, priority: r.priority } });
  }
  const affs = [
    { name: "Lannister", description: "Allied collective standing with Lonestar.", category: "AFFILIATE", order: 0, visible: true, logoUrl: "/aff-lannister.png" },
    { name: "Celestia", description: "Allied community in orbit with Lonestar.", category: "AFFILIATE", order: 1, visible: true, logoUrl: "/aff-celestia.png" },
    { name: "Lonestar", description: "The home collective.", category: "AFFILIATE", order: 2, visible: true, logoUrl: "/aff-lonestar.png" }
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
