import { BarList } from "@/components/BarList";
import { WarehouseForm } from "@/components/WarehouseForm";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary, getWarehouses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const [summary, warehouses, currentUser] = await Promise.all([
    getDashboardSummary(),
    getWarehouses(),
    getSessionUser()
  ]);
  const isAdmin = currentUser?.role.name === "ADMIN";

  return (
    <main>
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="section-title">仓库管理</h1>
            <p className="section-subtitle">查看各仓库库存分布、快速新增仓库。</p>
          </div>
          <div className="tag">{isAdmin ? "可编辑" : "只读"}</div>
        </div>
        <div className="grid-2">
          {isAdmin ? (
            <WarehouseForm />
          ) : (
            <div className="panel form-card">
              <div className="tag">只读模式</div>
              <h3 style={{ margin: "12px 0 6px" }}>当前账号没有新增仓库权限</h3>
              <p className="muted" style={{ margin: 0 }}>
                普通用户可以查看各仓库状态分布和仓库列表。
              </p>
            </div>
          )}
          <div className="panel chart-card">
            <div className="section-head">
              <div>
                <h2 className="section-title" style={{ fontSize: 20 }}>
                  全局状态分布
                </h2>
                <p className="section-subtitle">所有仓库机器人状态总览。</p>
              </div>
            </div>
            <BarList items={summary.byStatus} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">仓库列表</h2>
            <p className="section-subtitle">按仓库查看基本信息。</p>
          </div>
        </div>
        <div className="grid-3">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="panel warehouse-card">
              <div className="tag">{warehouse.code}</div>
              <h3 style={{ margin: "12px 0 8px" }}>{warehouse.name}</h3>
              <div className="muted small">{warehouse.location}</div>
              <div className="spacer" />
              <div className="pill good">查看状态详情</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
