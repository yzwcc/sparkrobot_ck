import { apiErrorResponse } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({
      data: users.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role.name,
        createdAt: user.createdAt.toISOString()
      }))
    });
  } catch (error) {
    return apiErrorResponse(error, "获取用户失败");
  }
}
