import { BarList } from "@/components/BarList";
import { LoginPanel } from "@/components/LoginPanel";
import { MetricCard } from "@/components/MetricCard";
import { RecordTable } from "@/components/RecordTable";
import { QuickActionDrawer } from "@/components/QuickActionDrawer";
import { WarehouseSummaryCard } from "@/components/WarehouseSummaryCard";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary, getRobotOptions, getWarehouses } from "@/lib/store";

export const dynamic = "force-dynamic";

const quickLinks = [
  { href: "#quick-actions", title: "快速出入库", desc: "一键打开入库、出库、状态", tag: "高频" },
  { href: "/robots", title: "机器人档案", desc: "SN、仓库、状态一目了然", tag: "管理" },
  { href: "/warehouses", title: "仓库总览", desc: "按仓库看库存与结构", tag: "查看" },
  { href: "/records", title: "操作记录", desc: "追踪全部历史动作", tag: "追踪" }
] as const;

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
      <section className="hero hero-dashboard hero-console">
        <div className="panel hero-main hero-hero-card hero-console-main">
          <div className="hero-topline">
            <div className="eyebrow">SparkRobot Control Center</div>
            <div className="tag">Live</div>
          </div>
          <h1>仓库机器人控制台</h1>
          <p>集中查看库存、仓库、状态和操作记录，把高频任务压缩到最少点击。</p>
          <div className="hero-actions-row">
            <QuickActionDrawer robots={robotOptions} warehouses={warehouses} />
            <a className="button-secondary" href="/records">查看记录</a>
            <a className="button-secondary" href="/robots">机器人管理</a>
          </div>
          <div className="hero-kpis">
            <div className="hero-kpi">
              <div className="mini-label">总机器人</div>
              <div className="hero-kpi-value">{summary.totalRobots}</div>
            </div>
            <div className="hero-kpi">
              <div className="mini-label">仓库数</div>
              <div className="hero-kpi-value">{summary.totalWarehouses}</div>
            </div>
            <div className="hero-kpi">
              <div className="mini-label">空闲</div>
              <div className="hero-kpi-value">{summary.idleCount}</div>
            </div>
            <div className="hero-kpi">
              <div className="mini-label">在租</div>
              <div className="hero-kpi-value">{summary.rentedCount}</div>
            </div>
          </div>
        </div>

        <div className="hero-side-stack hero-side-tight">
          <div className="panel hero-side-visual hero-stats-card hero-glass-card">
            <div className="mini-title">今日概览</div>
            <div className="mini-grid">
              <div><div className="mini-label">维修 / 损坏</div><div className="mini-value">{summary.repairCount + summary.damagedCount}</div></div>
              <div><div className="mini-label">缺少配件</div><div className="mini-value">{summary.accessoryCount}</div></div>
              <div><div className="mini-label">销售</div><div className="mini-value">{summary.saleCount}</div></div>
              <div><div className="mini-label">最近记录</div><div className="mini-value">{summary.recentRecords.length}</div></div>
            </div>
            <div className="mini-divider" />
            <div className="mini-list">
              <div className="row small"><span>当前用户</span><strong>{currentUser ? currentUser.displayName : "未登录"}</strong></div>
              <div className="row small"><span>权限</span><strong>{currentUser?.role.name ?? "GUEST"}</strong></div>
            </div>
          </div>
          <LoginPanel currentUser={currentUser ? { displayName: currentUser.displayName, role: currentUser.role.name } : null} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">控制入口</h2>
            <p className="section-subtitle">减少导航层级，常用模块直接可达。</p>
          </div>
        </div>
        <div className="entry-grid">
          {quickLinks.map((item) => (
            <a className="entry-card" href={item.href} key={item.title}>
              <div className="tag">{item.tag}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="stats-grid stats-grid-soft">
        <MetricCard label="机器人总数" value={summary.totalRobots} hint="可追踪" />
        <MetricCard label="空闲" value={summary.idleCount} tone="good" />
        <MetricCard label="在租" value={summary.rentedCount} tone="warn" />
        <MetricCard label="维修/损坏" value={`${summary.repairCount + summary.damagedCount}`} tone="danger" />
      </section>

      <section className="grid-2">
        <div className="panel chart-card soft-panel">
          <div className="section-head">
            <div>
              <h2 className="section-title">机型分布</h2>
              <p className="section-subtitle">快速看库存结构。</p>
            </div>
          </div>
          <BarList items={summary.byType} />
        </div>
        <div className="panel chart-card soft-panel">
          <div className="section-head">
            <div>
              <h2 className="section-title">状态分布</h2>
              <p className="section-subtitle">识别可用库存和异常状态。</p>
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
              <p className="section-subtitle">全部操作集中在抽屉里，页面保持简洁。</p>
            </div>
            <div className="tag">高频</div>
          </div>
          <div className="quick-action-strip">
            <div className="quick-action-copy">
              <strong>快速操作</strong>
              <span>入库、出库、状态变更统一处理。</span>
            </div>
            <QuickActionDrawer robots={robotOptions} warehouses={warehouses} />
          </div>
        </section>
      ) : null}

      {canManageUsers ? (
        <section className="section">
          <div className="panel form-card soft-panel">
            <div className="tag">用户管理</div>
            <h3 style={{ margin: "12px 0 6px" }}>二级管理员管理</h3>
            <p className="muted" style={{ margin: 0 }}>普通用户可注册，管理员可升级或撤销二级管理员权限。</p>
          </div>
        </section>
      ) : null}

      <section className="section" id="warehouses">
        <div className="section-head">
          <div>
            <h2 className="section-title">仓库概览</h2>
            <p className="section-subtitle">按仓库查看库存与最近记录。</p>
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
            <h2 className="section-title">最近记录</h2>
            <p className="section-subtitle">最新出入库和状态变更。</p>
          </div>
        </div>
        <div className="panel list-card soft-panel">
          <RecordTable records={summary.recentRecords} />
        </div>
      </section>
    </main>
  );
}
