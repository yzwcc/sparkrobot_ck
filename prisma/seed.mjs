import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const robotTypes = [
  { code: "YUANZHENG_A3", label: "远征A3" },
  { code: "YUANZHENG_A2", label: "远征A2" },
  { code: "LINGXI_X2_FLAGSHIP", label: "灵犀X2旗舰款" },
  { code: "LINGXI_X2_YOUTH", label: "灵犀X2青春款" }
];

const orderStatuses = [
  { code: "IDLE", label: "空闲" },
  { code: "DAILY_RENTAL", label: "日租" },
  { code: "MONTHLY_RENTAL", label: "月租" },
  { code: "SALE", label: "销售" },
  { code: "REPAIR", label: "维修" },
  { code: "DAMAGED", label: "损坏" },
  { code: "MISSING_ACCESSORIES", label: "缺少配件" }
];

function mapRobotType(label) {
  return robotTypes.find((item) => item.label === label)?.code ?? "YUANZHENG_A3";
}

function mapStatus(label) {
  return orderStatuses.find((item) => item.label === label)?.code ?? "IDLE";
}

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" }
  });

  await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" }
  });

  const warehouseA = await prisma.warehouse.upsert({
    where: { code: "WH-A" },
    update: {},
    create: { code: "WH-A", name: "上海主仓", location: "上海市嘉定区" }
  });
  const warehouseB = await prisma.warehouse.upsert({
    where: { code: "WH-B" },
    update: {},
    create: { code: "WH-B", name: "华东周转仓", location: "苏州市工业园区" }
  });
  const warehouseC = await prisma.warehouse.upsert({
    where: { code: "WH-C" },
    update: {},
    create: { code: "WH-C", name: "维修备件仓", location: "昆山市开发区" }
  });

  const robots = [
    { sn: "A3-2024-0001", type: "远征A3", status: "空闲", note: "首批样机", warehouseId: warehouseA.id },
    { sn: "A3-2024-0002", type: "远征A3", status: "日租", note: "", warehouseId: warehouseA.id },
    { sn: "A2-2024-0001", type: "远征A2", status: "维修", note: "等待轮组配件", warehouseId: warehouseC.id },
    { sn: "X2F-2024-0001", type: "灵犀X2旗舰款", status: "销售", note: "已分配订单", warehouseId: warehouseB.id },
    { sn: "X2Y-2024-0001", type: "灵犀X2青春款", status: "缺少配件", note: "缺少视觉模块", warehouseId: warehouseC.id }
  ];

  for (const robot of robots) {
    const created = await prisma.robot.upsert({
      where: { sn: robot.sn },
      update: {
        type: mapRobotType(robot.type),
        status: mapStatus(robot.status),
        note: robot.note,
        warehouseId: robot.warehouseId
      },
      create: {
        sn: robot.sn,
        type: mapRobotType(robot.type),
        status: mapStatus(robot.status),
        note: robot.note,
        warehouseId: robot.warehouseId
      }
    });

    await prisma.stockRecord.create({
      data: {
        action: "IN",
        robotId: created.id,
        warehouseId: created.warehouseId,
        operatorName: "seed",
        statusAfter: created.status,
        note: "Seed data",
        occurredAt: new Date()
      }
    });
  }

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      displayName: "系统管理员",
      password: "admin123",
      roleId: adminRole.id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

