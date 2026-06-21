import Link from "next/link";
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
            <p className="section-subtitle">查看各仓库库存分布，管理员可新增仓库并进入详情页管理仓库信息。</p>
          </div>
          <div className="tag">{isAdmin ? "管理员模式" : "只读"}</div>
        </div>
        <div className="grid-2">
          {isAdmin ? (
            <WarehouseForm />
          ) : (
            <div className="panel form-card">
              <div className="tag">只读模式</div>
              <h3 style={{ margin: "12px 0 6px" }}>当前账号没有仓库管理权限</h3>
              <p className="muted" style={{ margin: 0 }}>
                普通用户和二级管理员可以查看仓库分布与详情，仓库新增、修改、删除仅系统管理员可执行。
              </p>
            </div>
          )}
          <div className="panel chart-card">
            <div className="section-head">
              <div>
                <h2 className="section-title" style={{ fontSize: 20 }}>全局状态分布</h2>
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
            <p className="section-subtitle">点击卡片进入仓库详情，管理员可以在详情页编辑和删除仓库。</p>
          </div>
        </div>
        <div className="grid-3">
          {warehouses.map((warehouse) => {
            const card = summary.warehouseCards.find((item) => item.id === warehouse.id);
            return (
              <Link key={warehouse.id} href={`/warehouses/${warehouse.code}`} className="panel warehouse-card warehouse-link-card">
                <div className="row">
                  <div className="tag">{warehouse.code}</div>
                  <div className="pill good">查看详情</div>
                </div>
                <h3 style={{ margin: "12px 0 8px" }}>{warehouse.name}</h3>
                <div className="muted small">{warehouse.location}</div>
                <div className="spacer" />
                <div className="list">
                  <div className="row small">
                    <span>机器人数量</span>
                    <strong>{card?.total ?? 0}</strong>
                  </div>
                  <div className="row small">
                    <span>最近记录</span>
                    <strong>{card?.recentRecords.length ?? 0}</strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
