export const ROBOT_TYPES = [
  "远征A3",
  "远征A2旗舰款",
  "远征A2青春款",
  "灵犀X2旗舰款",
  "灵犀X2青春款",
  "D1 ultra",
  "D1 edu",
  "D1 pro",
  "D1 max"
] as const;

export const ROBOT_TYPE_CODES = [
  "YUANZHENG_A3",
  "YUANZHENG_A2_FLAGSHIP",
  "YUANZHENG_A2_YOUTH",
  "LINGXI_X2_FLAGSHIP",
  "LINGXI_X2_YOUTH",
  "D1_ULTRA",
  "D1_EDU",
  "D1_PRO",
  "D1_MAX"
] as const;

export const ORDER_STATUSES = [
  "空闲",
  "日租",
  "月租",
  "销售",
  "维修",
  "损坏",
  "缺少配件"
] as const;

export const STOCK_ACTIONS = ["IN", "OUT", "STATUS"] as const;
export const STOCK_ORIGINS = ["ROBOT_CREATE", "STOCK_IN", "STOCK_OUT", "STATUS_CHANGE"] as const;

export type RobotType = (typeof ROBOT_TYPES)[number];
export type RobotTypeCode = (typeof ROBOT_TYPE_CODES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type StockAction = (typeof STOCK_ACTIONS)[number];
export type StockOrigin = (typeof STOCK_ORIGINS)[number];

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Robot {
  id: string;
  sn: string;
  type: RobotType;
  status: OrderStatus;
  note: string;
  warehouseId: string | null;
  warehouseName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockRecord {
  id: string;
  action: StockAction;
  robotId: string;
  robotSn: string;
  robotType: RobotType;
  warehouseId: string | null;
  warehouseName: string | null;
  operatorName: string;
  statusBefore: OrderStatus | null;
  statusAfter: OrderStatus | null;
  origin?: StockOrigin | null;
  note: string;
  occurredAt: string;
  createdAt: string;
}

export interface AppData {
  warehouses: Warehouse[];
  robots: Robot[];
  records: StockRecord[];
}

export interface DashboardSummary {
  totalRobots: number;
  totalWarehouses: number;
  idleCount: number;
  rentedCount: number;
  saleCount: number;
  repairCount: number;
  damagedCount: number;
  accessoryCount: number;
  byType: Array<{ label: RobotType; value: number }>;
  byStatus: Array<{ label: OrderStatus; value: number }>;
  warehouseCards: Array<{
    id: string;
    code: string;
    name: string;
    location: string;
    total: number;
    statusBreakdown: Array<{ label: OrderStatus; value: number }>;
    recentRecords: StockRecord[];
  }>;
  recentRecords: StockRecord[];
}

export interface RobotInput {
  sn: string;
  type: RobotType;
  warehouseId?: string | null;
  status?: OrderStatus;
  note?: string;
}

export interface WarehouseInput {
  code: string;
  name: string;
  location: string;
}

export interface RecordFilter {
  action?: StockAction | "ALL";
  warehouseId?: string | "ALL";
  status?: OrderStatus | "ALL";
  search?: string;
  from?: string;
  to?: string;
}
