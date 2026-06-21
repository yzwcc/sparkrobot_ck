import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
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
}
