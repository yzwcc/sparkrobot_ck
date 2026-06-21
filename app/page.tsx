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
  {
    id: "a3",
    title: "远征A3",
    subtitle: "为舞台而生的硅基明星",
    image: "/a3-product.png",
    tone: "dark",
    desc: "适合展示、讲解、前台接待和复杂场景演示。"
  },
  {
    id: "x2",
    title: "灵犀X2",
    subtitle: "有趣、温暖、好奇心爆棚",
    image: "/x2-product.png",
    tone: "light",
    desc: "适合互动体验、校园展陈和面向用户的服务场景。"
  },
  {
    id: "a2",
    title: "远征A2",
    subtitle: "交互服务机器人",
    image: "/a2-product.png",
    tone: "blue",
    desc: "适合服务导览、企业接待、展厅讲解与标准化交互任务。"
  }
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
      <section className="hero hero-dashboard hero-brand">
        <div className="panel hero-main hero-brand-main">
          <div className="eyebrow">SparkRobot Control Center</div>
          <h1>把机器人仓库做成一眼就懂的正式产品站</h1>
          <p>
            统一查看机器人类型、仓库归属、订单状态、出入库记录与审计轨迹。
            通过更清晰的视觉层级，让仓库管理更像一套可以对外展示的产品。
          </p>
          <div className="spacer" />
          <div className="actions">
            <a className="button-primary" href="#products" style={{ display: "inline-flex", alignItems: "center" }}>看产品展示</a>
            <a className="button-secondary" href="#quick-actions" style={{ display: "inline-flex", alignItems: "center" }}>快速出入库</a>
            <a className="button-secondary" href="/records" style={{ display: "inline-flex", alignItems: "center" }}>查看记录</a>
          </div>
          <div className="hero-traits">
            <span className="pill good">实时库存</span>
            <span className="pill warn">全流程追踪</span>
            <span className="pill">支持注册</span>
          </div>
        </div>

        <div className="hero-side-stack">
          <div className="panel hero-side-visual hero-spotlight">
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
            <h2 className="section-title">产品视觉展示</h2>
            <p className="section-subtitle">直接使用你提供的三张产品图，作为首页核心视觉。</p>
          </div>
          <div className="tag">品牌展示区</div>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className={`panel product-card tone-${product.tone}`}>
              <div className="product-copy">
                <div className="product-title-row">
                  <div>
                    <div className="product-kicker">{product.title}</div>
                    <h3>{product.subtitle}</h3>
                  </div>
                  <div className="product-tag">{product.id === "a3" ? "旗舰舞台" : product.id === "x2" ? "人格角色" : "服务交互"}</div>
                </div>
                <p>{product.desc}</p>
              </div>
              <div className="product-image-wrap">
                <Image src={product.image} alt={product.title} fill className="product-image" priority={product.id === "a3"} />
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
