import { createWarehouse, getWarehouses } from "@/lib/store";
import { requireManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const warehouses = await getWarehouses();
  return Response.json({ data: warehouses });
}

export async function POST(request: Request) {
  try {
    await requireManager();
    const body = await request.json();
    const warehouse = await createWarehouse(body);
    return Response.json({ data: warehouse }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 400 }
    );
  }
}
