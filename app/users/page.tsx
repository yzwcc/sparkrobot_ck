import { UserManagementPanel } from "@/components/UserManagementPanel";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const currentUser = await getSessionUser();

  if (currentUser?.role.name !== "ADMIN") {
    return (
      <main>
        <section className="section">
          <div className="panel form-card">
            <div className="tag">无权限</div>
            <h2 style={{ margin: "12px 0 6px" }}>只有管理员可以查看用户管理</h2>
            <p className="muted" style={{ margin: 0 }}>
              普通用户和二级管理员无法访问这个页面。
            </p>
          </div>
        </section>
      </main>
    );
  }

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main>
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="section-title">用户管理</h1>
            <p className="section-subtitle">查看注册用户，并将普通用户升级为二级管理员。</p>
          </div>
        </div>
        <UserManagementPanel
          users={users.map((user) => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role.name,
            createdAt: user.createdAt.toISOString()
          }))}
        />
      </section>
    </main>
  );
}
