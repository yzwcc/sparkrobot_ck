import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const robotTypes = [
  { code: "YUANZHENG_A3", label: "远征A3" },
  { code: "YUANZHENG_A2_FLAGSHIP", label: "远征A2旗舰款" },
  { code: "YUANZHENG_A2_YOUTH", label: "远征A2青春款" },
  { code: "LINGXI_X2_FLAGSHIP", label: "灵犀X2旗舰款" },
  { code: "LINGXI_X2_YOUTH", label: "灵犀X2青春款" },
  { code: "D1_ULTRA", label: "D1 ultra" },
  { code: "D1_EDU", label: "D1 edu" },
  { code: "D1_PRO", label: "D1 pro" },
  { code: "D1_MAX", label: "D1 max" }
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
  const adminRole = await prisma.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN" } });
  const managerRole = await prisma.role.upsert({ where: { name: "MANAGER" }, update: {}, create: { name: "MANAGER" } });
  const userRole = await prisma.role.upsert({ where: { name: "USER" }, update: {}, create: { name: "USER" } });

  const warehouseA = await prisma.warehouse.upsert({
    where: { code: "WH-A" },
    update: { name: "上海主仓", location: "上海市嘉定区" },
    create: { code: "WH-A", name: "上海主仓", location: "上海市嘉定区" }
  });
  const warehouseB = await prisma.warehouse.upsert({
    where: { code: "WH-B" },
    update: { name: "华东周转仓", location: "苏州市工业园区" },
    create: { code: "WH-B", name: "华东周转仓", location: "苏州市工业园区" }
  });
  const warehouseC = await prisma.warehouse.upsert({
    where: { code: "WH-C" },
    update: { name: "维修备件仓", location: "昆山市开发区" },
    create: { code: "WH-C", name: "维修备件仓", location: "昆山市开发区" }
  });

  const robots = [
    { sn: "A3-2024-0001", type: "远征A3", status: "空闲", note: "首批样机", warehouseId: warehouseA.id },
    { sn: "A3-2024-0002", type: "远征A3", status: "日租", note: "", warehouseId: warehouseA.id },
    { sn: "A2F-2024-0001", type: "远征A2旗舰款", status: "维修", note: "等待轮组配件", warehouseId: warehouseC.id },
    { sn: "A2Y-2024-0001", type: "远征A2青春款", status: "销售", note: "已分配订单", warehouseId: warehouseB.id },
    { sn: "LX2F-2024-0001", type: "灵犀X2旗舰款", status: "缺少配件", note: "缺少视觉模块", warehouseId: warehouseC.id },
    { sn: "LX2Y-2024-0001", type: "灵犀X2青春款", status: "空闲", note: "", warehouseId: warehouseA.id },
    { sn: "D1U-2024-0001", type: "D1 ultra", status: "空闲", note: "", warehouseId: warehouseA.id },
    { sn: "D1E-2024-0001", type: "D1 edu", status: "月租", note: "", warehouseId: warehouseB.id },
    { sn: "D1P-2024-0001", type: "D1 pro", status: "空闲", note: "", warehouseId: warehouseC.id },
    { sn: "D1M-2024-0001", type: "D1 max", status: "维修", note: "", warehouseId: warehouseC.id }
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

    await prisma.stockRecord.upsert({
      where: { id: `${created.id}-seed-in` },
      update: {
        warehouseId: created.warehouseId,
        statusAfter: created.status,
        note: "Seed data"
      },
      create: {
        id: `${created.id}-seed-in`,
        action: "IN",
        origin: "ROBOT_CREATE",
        robotId: created.id,
        warehouseId: created.warehouseId,
        operatorName: "seed",
        snPhotoUrl: null,
        statusAfter: created.status,
        note: "Seed data",
        occurredAt: new Date()
      }
    });
  }

  await prisma.user.upsert({
    where: { username: "zhangyan" },
    update: {
      displayName: "系统管理员",
      password: "sparkrobot",
      roleId: adminRole.id
    },
    create: {
      username: "zhangyan",
      displayName: "系统管理员",
      password: "sparkrobot",
      roleId: adminRole.id
    }
  });

  await prisma.user.upsert({
    where: { username: "manager" },
    update: {
      displayName: "二级管理员",
      password: "manager123",
      roleId: managerRole.id
    },
    create: {
      username: "manager",
      displayName: "二级管理员",
      password: "manager123",
      roleId: managerRole.id
    }
  });

  await prisma.user.upsert({
    where: { username: "viewer" },
    update: {
      displayName: "普通用户",
      password: "viewer123",
      roleId: userRole.id
    },
    create: {
      username: "viewer",
      displayName: "普通用户",
      password: "viewer123",
      roleId: userRole.id
    }
  });
}

main().then(async () => {
  await prisma.$disconnect();
}).catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
