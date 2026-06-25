import { apiErrorResponse } from "@/lib/api-error";
import { requireManager } from "@/lib/auth";
import { changeRobotStatus } from "@/lib/store";
import { ORDER_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireManager();
    const body = await request.json();
    const { robotId, status, operatorName, note } = body as {
      robotId?: string;
      status?: string;
      operatorName?: string;
      note?: string;
    };
    if (!robotId || !status || !operatorName) {
      throw new Error("robotId、status 和 operatorName 为必填项");
    }
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      throw new Error("无效的订单状态");
    }
    const robot = await changeRobotStatus(
      robotId,
      status as (typeof ORDER_STATUSES)[number],
      operatorName,
      note ?? "",
      user.id
    );
    return Response.json({ data: robot });
  } catch (error) {
    return apiErrorResponse(error, "更新失败");
  }
}
