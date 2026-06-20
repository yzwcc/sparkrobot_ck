import { ActionPill } from "@/components/StatusPill";
import { StockRecord } from "@/lib/types";

export function RecordTable({ records }: { records: StockRecord[] }) {
  if (!records.length) {
    return <div className="empty">没有符合条件的记录</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>动作</th>
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
              <td>
                <ActionPill action={record.action} />
              </td>
              <td>
                <div>{record.robotSn}</div>
                <div className="muted small">{record.robotType}</div>
              </td>
              <td>{record.warehouseName ?? "未入库"}</td>
              <td>
                <div>{record.statusBefore ?? "无"}</div>
                <div className="muted small">→ {record.statusAfter ?? "无"}</div>
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

