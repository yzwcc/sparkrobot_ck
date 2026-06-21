import { createRobot, getRobots } from "@/lib/store";
import { requireManager } from "@/lib/auth";

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
    return Response.json(
      { error: error instanceof Error ? error.message : "创建失败" },
      { status: 400 }
    );
  }
}
