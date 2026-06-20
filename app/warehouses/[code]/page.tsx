import { BarList } from "@/components/BarList";
import { RecordTable } from "@/components/RecordTable";
import { RobotTable } from "@/components/RobotTable";
import { getWarehouseByCode, getWarehouseDetail } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WarehouseDetailPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const warehouse = await getWarehouseByCode(code);
  if (!warehouse) {
    return (
      <main className="section">
        <div className="panel chart-card">仓库不存在</div>
      </main>
    );
  }
  const detail = await getWarehouseDetail(warehouse.id);
  const statusBreakdown = ["空闲", "日租", "月租", "销售", "维修", "损坏", "缺少配件"].map((label) => ({
    label,
    value: detail.robots.filter((robot) => robot.status === label).length
  }));

  return (
    <main>
      <section className="section">
        <div className="panel hero-main">
          <div className="eyebrow">Warehouse detail</div>
          <h1>{detail.warehouse.name}</h1>
          <p>
            编码 {detail.warehouse.code}，地址 {detail.warehouse.location}。这里集中展示该仓库下机器人的状态分布、机器人清单与最近操作记录。
          </p>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title" style={{ fontSize: 20 }}>
                状态分布
              </h2>
              <p className="section-subtitle">该仓库内机器人当前状态。</p>
            </div>
          </div>
          <BarList items={statusBreakdown} />
        </div>
        <div className="panel chart-card">
          <div className="section-head">
            <div>
              <h2 className="section-title" style={{ fontSize: 20 }}>
                仓库概况
              </h2>
            </div>
          </div>
          <div className="list">
            <div className="row small">
              <span>机器人总数</span>
              <strong>{detail.robots.length}</strong>
            </div>
            <div className="row small">
              <span>最近记录</span>
              <strong>{detail.recentRecords.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">机器人列表</h2>
          </div>
        </div>
        <div className="panel list-card">
          <RobotTable robots={detail.robots} />
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">最近操作记录</h2>
          </div>
        </div>
        <div className="panel list-card">
          <RecordTable records={detail.recentRecords} />
        </div>
      </section>
    </main>
  );
}
