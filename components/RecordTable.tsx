import { ActionPill } from "@/components/StatusPill";
import { StockRecord } from "@/lib/types";

function originLabel(origin?: string | null) {
  switch (origin) {
    case "ROBOT_CREATE":
      return "新建机器人";
    case "STOCK_IN":
      return "入库";
    case "STOCK_OUT":
      return "出库";
    case "STATUS_CHANGE":
      return "状态变更";
    default:
      return "-";
  }
}

export function RecordTable({ records }: { records: StockRecord[] }) {
  if (!records.length) {
    return <div className="empty">没有符合条件的记录。</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>动作</th>
            <th>来源</th>
            <th>机器人</th>
            <th>仓库</th>
            <th>状态</th>
            <th>操作人</th>
            <th>时间</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td><ActionPill action={record.action} /></td>
              <td>{originLabel(record.origin)}</td>
              <td>
                <div>{record.robotSn}</div>
                <div className="muted small">{record.robotType}</div>
              </td>
              <td>{record.warehouseName ?? "未入库"}</td>
              <td>
                <div>{record.statusBefore ?? "-"}</div>
                <div className="muted small">→ {record.statusAfter ?? "-"}</div>
              </td>
              <td>{record.operatorName}</td>
              <td>{new Date(record.occurredAt).toLocaleString("zh-CN")}</td>
              <td>{record.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
