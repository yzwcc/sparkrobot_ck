import { RobotCreationForm, CheckInForm, CheckOutForm, StatusUpdateForm } from "@/components/RobotForms";
import { RobotTable } from "@/components/RobotTable";
import { getSessionUser } from "@/lib/auth";
import { getRobotOptions, getRobots, getWarehouses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RobotsPage() {
  const [robots, warehouses, robotOptions, currentUser] = await Promise.all([
    getRobots(),
    getWarehouses(),
    getRobotOptions(),
    getSessionUser()
  ]);
  const role = currentUser?.role.name ?? "GUEST";
  const canManageStock = role === "ADMIN" || role === "MANAGER";
  const canManageRobots = role === "ADMIN";

  return (
    <main>
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="section-title">机器人管理</h1>
            <p className="section-subtitle">登记 SN、维护类型，并执行入库出库和状态变更。</p>
          </div>
          <div className="tag">{canManageRobots ? "可管理" : "只读模式"}</div>
        </div>
        {canManageRobots ? (
          <div className="grid-3">
            <RobotCreationForm warehouses={warehouses} />
            <StatusUpdateForm robots={robotOptions} />
            <div className="panel form-card">
              <div className="tag">管理提示</div>
              <h3 style={{ margin: "12px 0 6px" }}>推荐流程</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                先新建机器人，再做入库登记；如果需要离开仓库，使用出库；状态变更会单独记录，方便追踪维修、销售和租赁过程。
              </p>
            </div>
          </div>
        ) : (
          <div className="panel form-card">
            <div className="tag">只读模式</div>
            <h3 style={{ margin: "12px 0 6px" }}>当前账号仅可查看</h3>
            <p className="muted" style={{ margin: 0 }}>
              普通用户可以查看机器人列表、仓库归属和状态；入库、出库和状态修改需要管理员或二级管理员登录。
            </p>
          </div>
        )}
      </section>

      <section className="section">
        {canManageStock ? (
          <div className="grid-2">
            <CheckInForm robots={robotOptions} warehouses={warehouses} />
            <CheckOutForm robots={robotOptions} />
          </div>
        ) : null}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">机器人列表</h2>
            <p className="section-subtitle">展示当前仓库归属、状态和备注。</p>
          </div>
        </div>
        <div className="panel list-card">
          <RobotTable robots={robots} canManage={role === "ADMIN"} />
        </div>
      </section>
    </main>
  );
}
