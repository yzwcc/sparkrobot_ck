import { BarList } from "@/components/BarList";
import { LoginPanel } from "@/components/LoginPanel";
import { MetricCard } from "@/components/MetricCard";
import { RecordTable } from "@/components/RecordTable";
import { WarehouseSummaryCard } from "@/components/WarehouseSummaryCard";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, currentUser] = await Promise.all([getDashboardSummary(), getSessionUser()]);

  return (
    <main>
      <section className="hero">
        <div className="panel hero-main">
          <div className="eyebrow">Warehouse robotics control center</div>
          <h1>把每台机器人、每个仓库、每次出入库，都放进一张可视化看板里。</h1>
          <p>
            这个系统帮助你登记机器人 SN、跟踪类型和订单状态，执行入库与出库，查看仓库库存分布和历史记录，并把维修、销售、租赁和损坏状态统一纳管。
          </p>
          <div className="spacer" />
          <div className="actions">
            <span className="pill good">实时库存</span>
            <span className="pill warn">出入库追踪</span>
            <span className="pill danger">状态审计</span>
          </div>
        </div>
        <div className="panel hero-aside">
          <LoginPanel currentUser={currentUser ? { displayName: currentUser.displayName, role: currentUser.role.name } : null} />
        </div>
      </section>

      <section className="stats-grid">
        <MetricCard label="总机器人" value={summary.totalRobots} hint="台" />
        <MetricCard label="空闲" value={summary.idleCount} tone="good" />
        <MetricCard label="租赁中" value={summary.rentedCount} tone="warn" />
        <MetricCard label="维修/损坏" value={`${summary.repairCount + summary.damagedCount}`} tone="danger" />
      </section>

      <section className="grid-2">
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">机器人类型分布</h2>
              <p className="section-subtitle">四种型号的库存占比。</p>
            </div>
          </div>
          <BarList items={summary.byType} />
        </div>
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">订单状态分布</h2>
              <p className="section-subtitle">用于快速判断业务压力与可租赁库存。</p>
            </div>
          </div>
          <BarList items={summary.byStatus} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">仓库概览</h2>
            <p className="section-subtitle">每个仓库当前库存、状态结构和最近记录。</p>
          </div>
        </div>
        <div className="grid-warehouse">
          {summary.warehouseCards.map((warehouse) => (
            <WarehouseSummaryCard
              key={warehouse.id}
              code={warehouse.code}
              name={warehouse.name}
              location={warehouse.location}
              total={warehouse.total}
              statusBreakdown={warehouse.statusBreakdown}
              recentCount={warehouse.recentRecords.length}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">最近出入库与状态记录</h2>
            <p className="section-subtitle">按时间倒序展示关键操作。</p>
          </div>
        </div>
        <div className="panel list-card">
          <RecordTable records={summary.recentRecords} />
        </div>
      </section>
    </main>
  );
}
