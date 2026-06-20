import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "warehouse_robot_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { username: token },
    include: { role: true }
  });

  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role.name !== "ADMIN") {
    throw new Error("仅管理员可执行此操作");
  }
  return user;
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
