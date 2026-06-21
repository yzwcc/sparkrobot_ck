import { checkInRobot, checkOutRobot, getRecords } from "@/lib/store";
import { requireManager } from "@/lib/auth";
import { ORDER_STATUSES, STOCK_ACTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const status = url.searchParams.get("status");
  const records = await getRecords({
    action: action && STOCK_ACTIONS.includes(action as (typeof STOCK_ACTIONS)[number]) ? (action as (typeof STOCK_ACTIONS)[number]) : "ALL",
    warehouseId: url.searchParams.get("warehouseId") || "ALL",
    status: status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) ? (status as (typeof ORDER_STATUSES)[number]) : "ALL",
    search: url.searchParams.get("search") || "",
    from: url.searchParams.get("from") || "",
    to: url.searchParams.get("to") || ""
  });
  return Response.json({ data: records });
}

export async function POST(request: Request) {
  try {
    const user = await requireManager();
    const body = await request.json();
    const { action, robotId, warehouseId, operatorName, note } = body as {
      action?: "IN" | "OUT";
      robotId?: string;
      warehouseId?: string;
      operatorName?: string;
      note?: string;
    };
    if (!action || !robotId || !operatorName) {
      throw new Error("action、robotId 和 operatorName 为必填项");
    }
    if (action === "IN") {
      if (!warehouseId) {
        throw new Error("入库需要 warehouseId");
      }
      const robot = await checkInRobot(robotId, warehouseId, operatorName, note ?? "", user.id);
      return Response.json({ data: robot }, { status: 201 });
    }
    const robot = await checkOutRobot(robotId, operatorName, note ?? "", user.id);
    return Response.json({ data: robot }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "提交失败" },
      { status: 400 }
    );
  }
}
