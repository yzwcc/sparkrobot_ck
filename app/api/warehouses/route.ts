import { apiErrorResponse } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth";
import { createWarehouse, getWarehouses } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const warehouses = await getWarehouses();
  return Response.json({ data: warehouses });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const warehouse = await createWarehouse(body);
    return Response.json({ data: warehouse }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "创建失败");
  }
}
