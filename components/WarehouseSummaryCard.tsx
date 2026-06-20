import { StatusPill } from "@/components/StatusPill";
import { OrderStatus } from "@/lib/types";
import Link from "next/link";

type Props = {
  code: string;
  name: string;
  location: string;
  total: number;
  statusBreakdown: Array<{ label: OrderStatus; value: number }>;
  recentCount: number;
};

export function WarehouseSummaryCard({ code, name, location, total, statusBreakdown, recentCount }: Props) {
  const hotStatus = statusBreakdown
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)[0];

  return (
    <Link className="panel warehouse-card" href={`/warehouses/${code}`}>
      <div className="row">
        <div>
          <div className="tag">{code}</div>
          <h3 style={{ margin: "12px 0 6px" }}>{name}</h3>
          <div className="muted small">{location}</div>
        </div>
        {hotStatus ? <StatusPill status={hotStatus.label} /> : <span className="pill">暂无数据</span>}
      </div>
      <div className="spacer" />
      <div className="row">
        <div>
          <div className="stat-label">机器人总数</div>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {total}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="stat-label">近记录</div>
          <div className="stat-value" style={{ fontSize: 24 }}>
            {recentCount}
          </div>
        </div>
      </div>
      <div className="spacer" />
      <div className="list">
        {statusBreakdown
          .filter((item) => item.value > 0)
          .map((item) => (
            <div key={item.label} className="row small">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
      </div>
    </Link>
  );
}
