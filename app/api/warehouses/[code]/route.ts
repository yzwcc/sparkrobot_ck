import { apiErrorResponse } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth";
import { deleteWarehouse, updateWarehouse } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await requireAdmin();
    const { code } = await params;
    const body = await request.json();
    const warehouse = await updateWarehouse(code, body);
    return Response.json({ data: warehouse });
  } catch (error) {
    return apiErrorResponse(error, "更新失败");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await requireAdmin();
    const { code } = await params;
    await deleteWarehouse(code);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error, "删除失败");
  }
}
