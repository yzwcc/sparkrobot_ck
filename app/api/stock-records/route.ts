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
    const contentType = request.headers.get("content-type") ?? "";
    const body =
      contentType.includes("multipart/form-data")
        ? await request.formData()
        : await request.json();
    const getValue = (key: string) => {
      if (body instanceof FormData) return body.get(key);
      return (body as Record<string, unknown>)[key];
    };
    const action = String(getValue("action") ?? "");
    const robotId = String(getValue("robotId") ?? "");
    const warehouseId = String(getValue("warehouseId") ?? "");
    const operatorName = String(getValue("operatorName") ?? "");
    const note = String(getValue("note") ?? "");
    const snPhoto = getValue("snPhoto");
    if (!action || !robotId || !operatorName) {
      throw new Error("action、robotId 和 operatorName 为必填项");
    }
    if (!(snPhoto instanceof File) || snPhoto.size === 0) {
      throw new Error("请上传 SN 照片");
    }
    const snPhotoUrl = `data:${snPhoto.type || "image/jpeg"};base64,${Buffer.from(await snPhoto.arrayBuffer()).toString("base64")}`;
    if (action === "IN") {
      if (!warehouseId) {
        throw new Error("入库需要 warehouseId");
      }
      const robot = await checkInRobot(robotId, warehouseId, operatorName, note ?? "", user.id, snPhotoUrl);
      return Response.json({ data: robot }, { status: 201 });
    }
    const robot = await checkOutRobot(robotId, operatorName, note ?? "", user.id, snPhotoUrl);
    return Response.json({ data: robot }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "提交失败" },
      { status: 400 }
    );
  }
}
