import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "").trim();
    const rememberMe = body.rememberMe === true || body.rememberMe === "true";
    if (!username || !password) {
      throw new Error("用户名和密码不能为空");
    }

    const user = await prisma.user.findUnique({ where: { username }, include: { role: true } });
    if (!user || user.password !== password) {
      throw new Error("用户名或密码错误");
    }

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieName(), user.username, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined
    });

    return Response.json({
      data: {
        username: user.username,
        displayName: user.displayName,
        role: user.role.name
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "登录失败" },
      { status: 400 }
    );
  }
}
