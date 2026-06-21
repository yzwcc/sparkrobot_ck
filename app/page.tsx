import { BarList } from "@/components/BarList";
import { LoginPanel } from "@/components/LoginPanel";
import { MetricCard } from "@/components/MetricCard";
import { CheckInForm, CheckOutForm } from "@/components/RobotForms";
import { RecordTable } from "@/components/RecordTable";
import { WarehouseSummaryCard } from "@/components/WarehouseSummaryCard";
import { getSessionUser } from "@/lib/auth";
import { getDashboardSummary, getRobotOptions, getWarehouses } from "@/lib/store";
import Image from "next/image";

export const dynamic = "force-dynamic";

const featuredProducts = [
  { id: "a3", title: "远征A3", image: "/robot-bgs/a3-bg.png", accent: "A3" },
  { id: "x2", title: "灵犀X2", image: "/robot-bgs/x2-bg.png", accent: "X2" },
  { id: "a2", title: "远征A2", image: "/robot-bgs/a2-bg.png", accent: "A2" }
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
      <section className="hero hero-dashboard hero-background hero-cinema">
        <div className="hero-bg-layer">
          <Image src="/robot-bgs/a3-bg.png" alt="远征A3" fill className="bg-robot bg-left" priority />
          <Image src="/robot-bgs/x2-bg.png" alt="灵犀X2" fill className="bg-robot bg-center" priority />
          <Image src="/robot-bgs/a2-bg.png" alt="远征A2" fill className="bg-robot bg-right" priority />
          <div className="hero-bg-vignette" />
          <div className="hero-bg-spotlight" />
        </div>

        <div className="panel hero-main hero-overlay hero-hero-card">
          <div className="eyebrow">SparkRobot Control Center</div>
          <h1>让机器人作为背景，管理信息浮在前景</h1>
          <p>只保留机器人主体与氛围，其他产品文案不再参与页面内容。前景聚焦仓库管理、库存操作和审计。</p>
          <div className="spacer" />
          <div className="actions">
            <a className="button-primary" href="#quick-actions" style={{ display: "inline-flex", alignItems: "center" }}>快速出入库</a>
            <a className="button-secondary" href="/robots" style={{ display: "inline-flex", alignItems: "center" }}>机器人管理</a>
            <a className="button-secondary" href="/records" style={{ display: "inline-flex", alignItems: "center" }}>记录</a>
          </div>
          <div className="hero-traits">
            <span className="pill good">实时库存</span>
            <span className="pill warn">全流程追踪</span>
            <span className="pill">支持注册</span>
          </div>
        </div>

        <div className="hero-side-stack">
          <div className="panel hero-side-visual hero-stats-card">
            <div className="mini-title">今日概览</div>
            <div className="mini-grid">
              <div><div className="mini-label">机器人总数</div><div className="mini-value">{summary.totalRobots}</div></div>
              <div><div className="mini-label">仓库数量</div><div className="mini-value">{summary.totalWarehouses}</div></div>
              <div><div className="mini-label">空闲</div><div className="mini-value">{summary.idleCount}</div></div>
              <div><div className="mini-label">在租</div><div className="mini-value">{summary.rentedCount}</div></div>
            </div>
            <div className="mini-divider" />
            <div className="mini-list">
              <div className="row small"><span>维修 / 损坏</span><strong>{summary.repairCount + summary.damagedCount}</strong></div>
              <div className="row small"><span>缺少配件</span><strong>{summary.accessoryCount}</strong></div>
              <div className="row small"><span>销售</span><strong>{summary.saleCount}</strong></div>
            </div>
          </div>
          <LoginPanel currentUser={currentUser ? { displayName: currentUser.displayName, role: currentUser.role.name } : null} />
        </div>
      </section>

      <section id="products" className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">机器人背景展示</h2>
            <p className="section-subtitle">只保留机器人本体与轮廓氛围。</p>
          </div>
          <div className="tag">背景素材区</div>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className="panel bg-card bg-card-large">
              <div className="bg-card-image-wrap">
                <Image src={product.image} alt={product.title} fill className="bg-card-image" />
                <div className="bg-card-mask" />
              </div>
              <div className="bg-card-caption">
                <div className="product-kicker">{product.accent}</div>
                <h3>{product.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <MetricCard label="机器人总数" value={summary.totalRobots} hint="可追踪" />
        <MetricCard label="空闲" value={summary.idleCount} tone="good" />
        <MetricCard label="在租" value={summary.rentedCount} tone="warn" />
        <MetricCard label="维修/损坏" value={`${summary.repairCount + summary.damagedCount}`} tone="danger" />
      </section>

      <section className="grid-2">
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">机器人类型分布</h2>
              <p className="section-subtitle">按机型查看当前库存占比。</p>
            </div>
          </div>
          <BarList items={summary.byType} />
        </div>
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title">订单状态分布</h2>
              <p className="section-subtitle">快速识别库存结构。</p>
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
              <p className="section-subtitle">管理员和二级管理员可以直接处理入库、出库和状态更新。</p>
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
            <h3 style={{ margin: "12px 0 6px" }}>管理员可升级或撤销二级管理员</h3>
            <p className="muted" style={{ margin: 0 }}>
              普通用户可自行注册；管理员可在用户页面将其升级为二级管理员，二级管理员可处理仓库出入库，但不能再分配管理员权限。
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
            <p className="section-subtitle">按时间倒序显示关键操作。</p>
          </div>
        </div>
        <div className="panel list-card">
          <RecordTable records={summary.recentRecords} />
        </div>
      </section>
    </main>
  );
}
