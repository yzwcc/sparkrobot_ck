import { createRobot, getRobots } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const robots = await getRobots();
  return Response.json({ data: robots });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const robot = await createRobot(body);
    return Response.json({ data: robot }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 400 }
    );
  }
}
