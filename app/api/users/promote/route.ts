import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    if (!userId) {
      throw new Error("userId 不能为空");
    }

    const role = await prisma.role.upsert({
      where: { name: "MANAGER" },
      update: {},
      create: { name: "MANAGER" }
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: { role: true }
    });

    return Response.json({
      data: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role.name
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "设置失败" },
      { status: 400 }
    );
  }
}
