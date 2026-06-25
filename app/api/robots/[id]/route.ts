import { apiErrorResponse } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth";
import { deleteRobot, updateRobot } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const robot = await updateRobot(id, body);
    return Response.json({ data: robot });
  } catch (error) {
    return apiErrorResponse(error, "更新失败");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteRobot(id);
    return Response.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error, "删除失败");
  }
}
