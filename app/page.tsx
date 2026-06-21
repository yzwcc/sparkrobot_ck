import { BarList } from "@/components/BarList";
import { LoginPanel } from "@/components/LoginPanel";
import { MetricCard } from "@/components/MetricCard";
import { CheckInForm, CheckOutForm } from "@/components/RobotForms";
import { RecordTable } from "@/components/RecordTable";
import { WarehouseSummaryCard } from "@/components/WarehouseSummaryCard";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary, getRobotOptions, getWarehouses } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, currentUser, robotOptions, warehouses] = await Promise.all([
    getDashboardSummary(),
    getSessionUser(),
    getRobotOptions(),
    getWarehouses()
  ]);
  const role = currentUser?.role.name ?? "GUEST";
  const canManageStock = role === "ADMIN" || role === "MANAGER";
  const canManageUsers = role === "ADMIN";

  return (
    <main>
      <section className="hero hero-dashboard">
        <div className="panel hero-main">
          <div className="eyebrow">SparkRobot Control Center</div>
          <h1>一套更专业的机器人仓库管理平台。</h1>
          <p>
            从机器人登记、入库出库，到仓库归属和订单状态，全部放在一个干净、直接、可视化的工作台里。
          </p>
          <div className="spacer" />
          <div className="actions">
            <a className="button-primary" href="#quick-actions" style={{ display: "inline-flex", alignItems: "center" }}>
              快速操作
            </a>
            <a className="button-secondary" href="/records" style={{ display: "inline-flex", alignItems: "center" }}>
              查看记录
            </a>
            <a className="button-secondary" href="/warehouses" style={{ display: "inline-flex", alignItems: "center" }}>
              仓库总览
            </a>
          </div>
          <div className="hero-traits">
            <span className="pill good">实时库存</span>
            <span className="pill warn">可追踪出入库</span>
            <span className="pill">注册开放</span>
          </div>
        </div>
        <div className="hero-side-stack">
          <div className="panel hero-side-visual">
            <div className="mini-title">今日概览</div>
            <div className="mini-grid">
              <div>
                <div className="mini-label">机器人总数</div>
                <div className="mini-value">{summary.totalRobots}</div>
              </div>
              <div>
                <div className="mini-label">仓库数量</div>
                <div className="mini-value">{summary.totalWarehouses}</div>
              </div>
              <div>
                <div className="mini-label">空闲</div>
                <div className="mini-value">{summary.idleCount}</div>
              </div>
              <div>
                <div className="mini-label">在租</div>
                <div className="mini-value">{summary.rentedCount}</div>
              </div>
            </div>
            <div className="mini-divider" />
            <div className="mini-list">
              <div className="row small">
                <span>维修 / 损坏</span>
                <strong>{summary.repairCount + summary.damagedCount}</strong>
              </div>
              <div className="row small">
                <span>缺少配件</span>
                <strong>{summary.accessoryCount}</strong>
              </div>
              <div className="row small">
                <span>销售</span>
                <strong>{summary.saleCount}</strong>
              </div>
            </div>
          </div>
          <LoginPanel currentUser={currentUser ? { displayName: currentUser.displayName, role: currentUser.role.name } : null} />
        </div>
      </section>

      <section className="stats-grid">
        <MetricCard label="总机器人" value={summary.totalRobots} hint="可追踪" />
        <MetricCard label="空闲" value={summary.idleCount} tone="good" />
        <MetricCard label="在租" value={summary.rentedCount} tone="warn" />
        <MetricCard label="维修/损坏" value={`${summary.repairCount + summary.damagedCount}`} tone="danger" />
      </section>

      <section className="grid-2">
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">机器人类型分布</h2>
              <p className="section-subtitle">四种机型的库存占比。</p>
            </div>
          </div>
          <BarList items={summary.byType} />
        </div>
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">订单状态分布</h2>
              <p className="section-subtitle">用于快速判断业务压力与可租资源。</p>
            </div>
          </div>
          <BarList items={summary.byStatus} />
        </div>
      </section>

      {canManageStock ? (
        <section className="section" id="quick-actions">
          <div className="section-head">
            <div>
              <h2 className="section-title">快捷出入库</h2>
              <p className="section-subtitle">管理员和二级管理员可直接完成机器人入库、出库和状态更新。</p>
            </div>
            <div className="tag">高频操作区</div>
          </div>
          <div className="grid-2">
            <CheckInForm robots={robotOptions} warehouses={warehouses} />
            <CheckOutForm robots={robotOptions} />
          </div>
        </section>
      ) : null}

      {canManageUsers ? (
        <section className="section">
          <div className="panel form-card">
            <div className="tag">用户管理</div>
            <h3 style={{ margin: "12px 0 6px" }}>管理员可以升级或撤销二级管理员</h3>
            <p className="muted" style={{ margin: 0 }}>
              普通用户可自行注册，管理员可在“用户”页面将其升级为二级管理员，二级管理员可以处理仓库出入库，但不能再分配权限。
            </p>
          </div>
        </section>
      ) : null}

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
