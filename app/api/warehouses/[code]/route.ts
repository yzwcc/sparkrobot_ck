import { deleteWarehouse, updateWarehouse } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await requireAdmin();
    const { code } = await params;
    const body = await request.json();
    const warehouse = await updateWarehouse(code, body);
    return Response.json({ data: warehouse });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "更新失败" },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await requireAdmin();
    const { code } = await params;
    await deleteWarehouse(code);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 400 }
    );
  }
}
