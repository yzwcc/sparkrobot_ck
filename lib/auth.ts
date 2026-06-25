import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "warehouse_robot_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: token },
      include: { role: true }
    });

    return user;
  } catch (error) {
    console.error("Session lookup failed; treating request as anonymous.", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role.name !== "ADMIN") {
    throw new Error("仅管理员可执行此操作");
  }
  return user;
}

export async function requireManager() {
  const user = await getSessionUser();
  if (!user || (user.role.name !== "ADMIN" && user.role.name !== "MANAGER")) {
    throw new Error("仅管理员或二级管理员可执行此操作");
  }
  return user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("请先登录");
  }
  return user;
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
