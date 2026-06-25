import { apiErrorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();

    if (!username || !password || !displayName) {
      throw new Error("用户名、密码和昵称不能为空");
    }

    if (password.length < 6) {
      throw new Error("密码至少 6 位");
    }

    const role = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!role) {
      throw new Error("普通用户角色不存在");
    }

    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        password,
        roleId: role.id
      }
    });

    return Response.json({
      data: {
        username: user.username,
        displayName: user.displayName,
        role: "USER"
      }
    });
  } catch (error) {
    return apiErrorResponse(error, "注册失败");
  }
}
