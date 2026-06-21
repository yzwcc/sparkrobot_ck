import { RecordTable } from "@/components/RecordTable";
import { getSessionUser } from "@/lib/auth";
import { getRecords, getWarehouses } from "@/lib/store";
import { ORDER_STATUSES, STOCK_ACTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type FilterAction = "IN" | "OUT" | "STATUS" | "ALL";
type FilterStatus = (typeof ORDER_STATUSES)[number] | "ALL";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RecordsPage({ searchParams }: { searchParams: Promise<SearchParams>; }) {
  const resolvedSearchParams = await searchParams;
  const [warehouses, currentUser] = await Promise.all([getWarehouses(), getSessionUser()]);
  const isAdmin = currentUser?.role.name === "ADMIN";
  const filters = {
    action: (first(resolvedSearchParams.action) ?? "ALL") as FilterAction,
    warehouseId: first(resolvedSearchParams.warehouseId) ?? "ALL",
    status: (first(resolvedSearchParams.status) ?? "ALL") as FilterStatus,
    search: first(resolvedSearchParams.search) ?? "",
    from: first(resolvedSearchParams.from) ?? "",
    to: first(resolvedSearchParams.to) ?? ""
  };
  const records = await getRecords(filters);

  return (
    <main>
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="section-title">记录中心</h1>
            <p className="section-subtitle">按动作、仓库、状态和时间筛选，照片可直接点开预览。</p>
          </div>
        </div>
        <form className="panel form-card" action="/records" method="get">
          <div className="form-grid">
            <div className="field">
              <label>关键词</label>
              <input name="search" defaultValue={filters.search} placeholder="SN、仓库、操作人" />
            </div>
            <div className="field">
              <label>动作类型</label>
              <select name="action" defaultValue={filters.action}>
                <option value="ALL">全部</option>
                {STOCK_ACTIONS.map((action) => <option key={action} value={action}>{action === "IN" ? "入库" : action === "OUT" ? "出库" : "状态变更"}</option>)}
              </select>
            </div>
            <div className="field">
              <label>仓库</label>
              <select name="warehouseId" defaultValue={filters.warehouseId}>
                <option value="ALL">全部</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} · {warehouse.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>状态</label>
              <select name="status" defaultValue={filters.status}>
                <option value="ALL">全部</option>
                {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="field">
              <label>开始日期</label>
              <input type="date" name="from" defaultValue={filters.from} />
            </div>
            <div className="field">
              <label>结束日期</label>
              <input type="date" name="to" defaultValue={filters.to} />
            </div>
          </div>
          <div className="spacer" />
          <div className="actions">
            <button className="button-primary" type="submit">应用筛选</button>
            <a className="button-secondary" href="/records" style={{ display: "inline-flex", alignItems: "center" }}>清空筛选</a>
            {!isAdmin ? <span className="small muted">当前仅可查看</span> : null}
          </div>
        </form>
      </section>

      <section className="section">
        <div className="panel list-card">
          <RecordTable records={records} />
        </div>
      </section>
    </main>
  );
}
