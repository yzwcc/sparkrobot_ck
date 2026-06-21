import { OrderStatus, StockAction } from "@/lib/types";

export function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === "空闲"
      ? "good"
      : status === "销售"
        ? "warn"
        : status === "维修" || status === "损坏" || status === "缺少配件"
          ? "danger"
          : "";
  return <span className={`pill ${tone}`.trim()}>{status}</span>;
}

export function ActionPill({ action }: { action: StockAction }) {
  const label = action === "IN" ? "入库" : action === "OUT" ? "出库" : "状态变更";
  const tone = action === "IN" ? "good" : action === "OUT" ? "warn" : "danger";
  return <span className={`pill ${tone}`}>{label}</span>;
}
