import { apiErrorResponse } from "@/lib/api-error";
import { requireManager } from "@/lib/auth";
import { createRobot, getRobots } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const robots = await getRobots();
  return Response.json({ data: robots });
}

export async function POST(request: Request) {
  try {
    const user = await requireManager();
    const body = await request.json();
    const robot = await createRobot(body, { id: user.id, name: user.displayName });
    return Response.json({ data: robot }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "创建失败");
  }
}
