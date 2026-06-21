import { prisma } from "@/lib/prisma";
import {
  AppData,
  DashboardSummary,
  ORDER_STATUSES,
  ROBOT_TYPES,
  OrderStatus,
  RecordFilter,
  Robot,
  RobotInput,
  RobotType,
  StockAction,
  StockOrigin,
  StockRecord,
  Warehouse,
  WarehouseInput
} from "@/lib/types";
import type { $Enums } from "@prisma/client";

const DEFAULT_STATUS: OrderStatus = "空闲";

function normalizeSn(sn: string) {
  return sn.trim().toUpperCase();
}

function normalizeText(value: string | undefined | null) {
  return (value ?? "").trim();
}

function assertRobotType(type: string): RobotType {
  if (!ROBOT_TYPES.includes(type as RobotType)) {
    throw new Error("无效的机器人类型");
  }
  return type as RobotType;
}

function assertStatus(status: string): OrderStatus {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw new Error("无效的订单状态");
  }
  return status as OrderStatus;
}

function mapRobotTypeToCode(type: RobotType): $Enums.RobotTypeCode {
  switch (type) {
    case "远征A3":
      return "YUANZHENG_A3";
    case "远征A2":
      return "YUANZHENG_A2";
    case "灵犀X2旗舰款":
      return "LINGXI_X2_FLAGSHIP";
    case "灵犀X2青春款":
      return "LINGXI_X2_YOUTH";
  }
}

function mapRobotTypeFromCode(type: $Enums.RobotTypeCode): RobotType {
  switch (type) {
    case "YUANZHENG_A3":
      return "远征A3";
    case "YUANZHENG_A2":
      return "远征A2";
    case "LINGXI_X2_FLAGSHIP":
      return "灵犀X2旗舰款";
    case "LINGXI_X2_YOUTH":
      return "灵犀X2青春款";
  }
}

function mapStatusToCode(status: OrderStatus): $Enums.OrderStatus {
  switch (status) {
    case "空闲":
      return "IDLE";
    case "日租":
      return "DAILY_RENTAL";
    case "月租":
      return "MONTHLY_RENTAL";
    case "销售":
      return "SALE";
    case "维修":
      return "REPAIR";
    case "损坏":
      return "DAMAGED";
    case "缺少配件":
      return "MISSING_ACCESSORIES";
  }
}

function mapStatusFromCode(status: $Enums.OrderStatus): OrderStatus {
  switch (status) {
    case "IDLE":
      return "空闲";
    case "DAILY_RENTAL":
      return "日租";
    case "MONTHLY_RENTAL":
      return "月租";
    case "SALE":
      return "销售";
    case "REPAIR":
      return "维修";
    case "DAMAGED":
      return "损坏";
    case "MISSING_ACCESSORIES":
      return "缺少配件";
  }
}

function mapActionFromCode(action: $Enums.StockAction): StockAction {
  return action;
}

function mapOriginFromCode(origin: $Enums.StockOrigin | null): StockOrigin | null {
  return origin ?? null;
}

function toIso(value: Date | string) {
  return new Date(value).toISOString();
}

function attachWarehouseName(robot: Robot, warehouseName: string | null) {
  return { ...robot, warehouseName };
}

async function ensureSeeded() {
  const roleCount = await prisma.role.count();
  if (roleCount > 0) return;

  const adminRole = await prisma.role.create({ data: { name: "ADMIN" } });
  await prisma.role.create({ data: { name: "MANAGER" } });
  await prisma.role.create({ data: { name: "USER" } });

  const warehouseA = await prisma.warehouse.create({
    data: { code: "WH-A", name: "上海主仓", location: "上海市嘉定区" }
  });
  const warehouseB = await prisma.warehouse.create({
    data: { code: "WH-B", name: "华东周转仓", location: "苏州市工业园区" }
  });
  const warehouseC = await prisma.warehouse.create({
    data: { code: "WH-C", name: "维修备件仓", location: "昆山市开发区" }
  });

  const seedRobots = [
    { sn: "A3-2024-0001", type: "远征A3" as RobotType, status: "空闲" as OrderStatus, note: "首批样机", warehouseId: warehouseA.id },
    { sn: "A3-2024-0002", type: "远征A3" as RobotType, status: "日租" as OrderStatus, note: "", warehouseId: warehouseA.id },
    { sn: "A2-2024-0001", type: "远征A2" as RobotType, status: "维修" as OrderStatus, note: "等待轮组配件", warehouseId: warehouseC.id },
    { sn: "X2F-2024-0001", type: "灵犀X2旗舰款" as RobotType, status: "销售" as OrderStatus, note: "已分配订单", warehouseId: warehouseB.id },
    { sn: "X2Y-2024-0001", type: "灵犀X2青春款" as RobotType, status: "缺少配件" as OrderStatus, note: "缺少视觉模块", warehouseId: warehouseC.id }
  ];

  for (const seed of seedRobots) {
    const robot = await prisma.robot.create({
      data: {
        sn: seed.sn,
        type: mapRobotTypeToCode(seed.type),
        status: mapStatusToCode(seed.status),
        note: seed.note,
        warehouseId: seed.warehouseId
      }
    });

    await prisma.stockRecord.create({
      data: {
        action: "IN",
        origin: "ROBOT_CREATE",
        robotId: robot.id,
        warehouseId: robot.warehouseId,
        operatorName: "seed",
        statusBefore: null,
        statusAfter: robot.status,
        note: "Seed data",
        occurredAt: new Date(robot.createdAt)
      }
    });
  }

  await prisma.user.create({
    data: {
      username: "admin",
      displayName: "系统管理员",
      password: "admin123",
      roleId: adminRole.id
    }
  });
}

async function readFromDatabase(): Promise<AppData> {
  await ensureSeeded();
  const [warehouses, robots, records] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { code: "asc" } }),
    prisma.robot.findMany({ orderBy: { updatedAt: "desc" }, include: { warehouse: true } }),
    prisma.stockRecord.findMany({
      orderBy: { occurredAt: "desc" },
      include: { warehouse: true, robot: true }
    })
  ]);

  return {
    warehouses: warehouses.map((warehouse) => ({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      createdAt: toIso(warehouse.createdAt),
      updatedAt: toIso(warehouse.updatedAt)
    })),
    robots: robots.map((robot) => ({
      id: robot.id,
      sn: robot.sn,
      type: mapRobotTypeFromCode(robot.type),
      status: mapStatusFromCode(robot.status),
      note: robot.note,
      warehouseId: robot.warehouseId,
      warehouseName: robot.warehouse?.name ?? null,
      createdAt: toIso(robot.createdAt),
      updatedAt: toIso(robot.updatedAt)
    })),
    records: records.map((record) => ({
      id: record.id,
      action: mapActionFromCode(record.action),
      robotId: record.robotId,
      robotSn: record.robot.sn,
      robotType: mapRobotTypeFromCode(record.robot.type),
      warehouseId: record.warehouseId,
      warehouseName: record.warehouse?.name ?? null,
      operatorName: record.operatorName,
      statusBefore: record.statusBefore ? mapStatusFromCode(record.statusBefore) : null,
      statusAfter: record.statusAfter ? mapStatusFromCode(record.statusAfter) : null,
      origin: mapOriginFromCode(record.origin),
      note: record.note,
      occurredAt: toIso(record.occurredAt),
      createdAt: toIso(record.createdAt)
    }))
  };
}

async function applyFallbackSnapshot(): Promise<AppData> {
  return readFromDatabase();
}

function filterRecords(records: StockRecord[], filters: RecordFilter) {
  return records.filter((record) => {
    const actionOk = !filters.action || filters.action === "ALL" || record.action === filters.action;
    const warehouseOk = !filters.warehouseId || filters.warehouseId === "ALL" || record.warehouseId === filters.warehouseId;
    const statusOk =
      !filters.status ||
      filters.status === "ALL" ||
      record.statusAfter === filters.status ||
      record.statusBefore === filters.status;
    const search = normalizeText(filters.search).toLowerCase();
    const searchOk =
      !search ||
      record.robotSn.toLowerCase().includes(search) ||
      record.robotType.toLowerCase().includes(search) ||
      record.operatorName.toLowerCase().includes(search) ||
      (record.warehouseName ?? "").toLowerCase().includes(search);
    const fromOk = !filters.from || record.occurredAt >= `${filters.from}T00:00:00.000Z`;
    const toOk = !filters.to || record.occurredAt <= `${filters.to}T23:59:59.999Z`;
    return actionOk && warehouseOk && statusOk && searchOk && fromOk && toOk;
  });
}

async function createAuditRecord(params: {
  action: StockAction;
  origin: StockOrigin;
  robotId: string;
  warehouseId: string | null;
  operatorName: string;
  operatorId?: string | null;
  statusBefore: OrderStatus | null;
  statusAfter: OrderStatus | null;
  note?: string;
}) {
  await prisma.stockRecord.create({
    data: {
      action: params.action,
      origin: params.origin,
      robotId: params.robotId,
      warehouseId: params.warehouseId,
      operatorName: normalizeText(params.operatorName) || "未填写",
      statusBefore: params.statusBefore ? mapStatusToCode(params.statusBefore) : null,
      statusAfter: params.statusAfter ? mapStatusToCode(params.statusAfter) : null,
      note: normalizeText(params.note),
      occurredAt: new Date(),
      userId: params.operatorId ?? null
    }
  });
}

export async function getRobots() {
  const data = await applyFallbackSnapshot();
  return data.robots;
}

export async function getWarehouses() {
  const data = await applyFallbackSnapshot();
  return data.warehouses;
}

export async function getRecords(filters: RecordFilter = {}) {
  const data = await applyFallbackSnapshot();
  return filterRecords(data.records, filters);
}

export async function getWarehouseDetail(warehouseId: string) {
  const data = await applyFallbackSnapshot();
  const warehouse = data.warehouses.find((item) => item.id === warehouseId);
  if (!warehouse) throw new Error("仓库不存在");
  const robots = data.robots.filter((robot) => robot.warehouseId === warehouseId);
  const recentRecords = data.records.filter((record) => record.warehouseId === warehouseId).slice(0, 10);
  return { warehouse, robots, recentRecords };
}

export async function getWarehouseByCode(code: string) {
  const data = await applyFallbackSnapshot();
  return data.warehouses.find((warehouse) => warehouse.code === code.toUpperCase()) ?? null;
}

export async function createWarehouse(input: WarehouseInput) {
  const code = normalizeText(input.code).toUpperCase();
  if (!code) throw new Error("仓库编码不能为空");
  await prisma.warehouse.create({
    data: {
      code,
      name: normalizeText(input.name),
      location: normalizeText(input.location)
    }
  });
  return { ok: true };
}

export async function createRobot(
  input: RobotInput,
  operator?: { id?: string | null; name?: string | null } | string
) {
  const sn = normalizeSn(input.sn);
  const type = assertRobotType(input.type);
  const status = input.status ? assertStatus(input.status) : DEFAULT_STATUS;
  if (!sn) throw new Error("SN 不能为空");

  const robot = await prisma.robot.create({
    data: {
      sn,
      type: mapRobotTypeToCode(type),
      status: mapStatusToCode(status),
      note: normalizeText(input.note),
      warehouseId: input.warehouseId ?? null
    },
    include: { warehouse: true }
  });

  const operatorName = typeof operator === "string" ? operator : operator?.name ?? "系统";
  const operatorId = typeof operator === "string" ? null : operator?.id ?? null;

  await createAuditRecord({
    action: "IN",
    origin: "ROBOT_CREATE",
    robotId: robot.id,
    warehouseId: robot.warehouseId,
    operatorName,
    operatorId,
    statusBefore: null,
    statusAfter: mapStatusFromCode(robot.status),
    note: `创建机器人：${robot.sn}`
  });

  return attachWarehouseName(
    {
      id: robot.id,
      sn: robot.sn,
      type,
      status,
      note: robot.note,
      warehouseId: robot.warehouseId,
      createdAt: toIso(robot.createdAt),
      updatedAt: toIso(robot.updatedAt)
    },
    robot.warehouse?.name ?? null
  );
}

export async function updateRobot(
  robotId: string,
  input: Partial<RobotInput & { note: string; warehouseId: string | null }>
) {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) throw new Error("机器人不存在");

  const next = await prisma.robot.update({
    where: { id: robotId },
    data: {
      sn: input.sn !== undefined ? normalizeSn(input.sn) : undefined,
      type: input.type !== undefined ? mapRobotTypeToCode(assertRobotType(input.type)) : undefined,
      status: input.status !== undefined ? mapStatusToCode(assertStatus(input.status)) : undefined,
      note: input.note !== undefined ? normalizeText(input.note) : undefined,
      warehouseId: input.warehouseId !== undefined ? input.warehouseId || null : undefined
    },
    include: { warehouse: true }
  });

  return {
    id: next.id,
    sn: next.sn,
    type: mapRobotTypeFromCode(next.type),
    status: mapStatusFromCode(next.status),
    note: next.note,
    warehouseId: next.warehouseId,
    warehouseName: next.warehouse?.name ?? null,
    createdAt: toIso(next.createdAt),
    updatedAt: toIso(next.updatedAt)
  };
}

export async function deleteRobot(robotId: string) {
  await prisma.robot.delete({ where: { id: robotId } });
}

export async function checkInRobot(
  robotId: string,
  warehouseId: string,
  operatorName: string,
  note = "",
  operatorId?: string | null
) {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) throw new Error("机器人不存在");
  if (robot.warehouseId) throw new Error("机器人当前已在仓库中，请先出库");
  const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
  if (!warehouse) throw new Error("目标仓库不存在");

  const next = await prisma.robot.update({
    where: { id: robotId },
    data: { warehouseId }
  });

  await createAuditRecord({
    action: "IN",
    origin: "STOCK_IN",
    robotId: next.id,
    warehouseId,
    operatorName,
    operatorId,
    statusBefore: null,
    statusAfter: mapStatusFromCode(next.status),
    note
  });

  return {
    id: next.id,
    sn: next.sn,
    type: mapRobotTypeFromCode(next.type),
    status: mapStatusFromCode(next.status),
    note: next.note,
    warehouseId: next.warehouseId,
    warehouseName: warehouse.name,
    createdAt: toIso(next.createdAt),
    updatedAt: toIso(next.updatedAt)
  };
}

export async function checkOutRobot(
  robotId: string,
  operatorName: string,
  note = "",
  operatorId?: string | null
) {
  const robot = await prisma.robot.findUnique({ where: { id: robotId }, include: { warehouse: true } });
  if (!robot) throw new Error("机器人不存在");
  if (!robot.warehouseId) throw new Error("机器人当前不在仓库中，无法出库");

  const previousStatus = mapStatusFromCode(robot.status);
  const next = await prisma.robot.update({
    where: { id: robotId },
    data: { warehouseId: null }
  });

  await createAuditRecord({
    action: "OUT",
    origin: "STOCK_OUT",
    robotId: next.id,
    warehouseId: robot.warehouseId,
    operatorName,
    operatorId,
    statusBefore: previousStatus,
    statusAfter: previousStatus,
    note
  });

  return {
    id: next.id,
    sn: next.sn,
    type: mapRobotTypeFromCode(next.type),
    status: mapStatusFromCode(next.status),
    note: next.note,
    warehouseId: next.warehouseId,
    warehouseName: null,
    createdAt: toIso(next.createdAt),
    updatedAt: toIso(next.updatedAt)
  };
}

export async function changeRobotStatus(
  robotId: string,
  status: OrderStatus,
  operatorName: string,
  note = "",
  operatorId?: string | null
) {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) throw new Error("机器人不存在");
  const nextStatus = assertStatus(status);
  const next = await prisma.robot.update({
    where: { id: robotId },
    data: { status: mapStatusToCode(nextStatus) }
  });

  await createAuditRecord({
    action: "STATUS",
    origin: "STATUS_CHANGE",
    robotId: next.id,
    warehouseId: next.warehouseId,
    operatorName,
    operatorId,
    statusBefore: mapStatusFromCode(robot.status),
    statusAfter: nextStatus,
    note
  });

  return {
    id: next.id,
    sn: next.sn,
    type: mapRobotTypeFromCode(next.type),
    status: nextStatus,
    note: next.note,
    warehouseId: next.warehouseId,
    warehouseName: null,
    createdAt: toIso(next.createdAt),
    updatedAt: toIso(next.updatedAt)
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const data = await applyFallbackSnapshot();
  const byType = ROBOT_TYPES.map((label) => ({ label, value: data.robots.filter((robot) => robot.type === label).length }));
  const byStatus = ORDER_STATUSES.map((label) => ({ label, value: data.robots.filter((robot) => robot.status === label).length }));
  const warehouseCards = data.warehouses.map((warehouse) => {
    const robots = data.robots.filter((robot) => robot.warehouseId === warehouse.id);
    const statusBreakdown = ORDER_STATUSES.map((label) => ({ label, value: robots.filter((robot) => robot.status === label).length }));
    const recentRecords = data.records.filter((record) => record.warehouseId === warehouse.id).slice(0, 5);
    return {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      total: robots.length,
      statusBreakdown,
      recentRecords
    };
  });
  const recentRecords = data.records.slice(0, 10);
  const idleCount = byStatus.find((entry) => entry.label === "空闲")?.value ?? 0;
  const rentedCount = (byStatus.find((entry) => entry.label === "日租")?.value ?? 0) + (byStatus.find((entry) => entry.label === "月租")?.value ?? 0);
  const saleCount = byStatus.find((entry) => entry.label === "销售")?.value ?? 0;
  const repairCount = byStatus.find((entry) => entry.label === "维修")?.value ?? 0;
  const damagedCount = byStatus.find((entry) => entry.label === "损坏")?.value ?? 0;
  const accessoryCount = byStatus.find((entry) => entry.label === "缺少配件")?.value ?? 0;

  return {
    totalRobots: data.robots.length,
    totalWarehouses: data.warehouses.length,
    idleCount,
    rentedCount,
    saleCount,
    repairCount,
    damagedCount,
    accessoryCount,
    byType,
    byStatus,
    warehouseCards,
    recentRecords
  };
}

export async function getRobotOptions() {
  const data = await applyFallbackSnapshot();
  return data.robots;
}
