import { RecordTable } from "@/components/RecordTable";
import { getSessionUser } from "@/lib/auth";
import { getRecordPage, getWarehouses } from "@/lib/store";
import { ORDER_STATUSES, STOCK_ACTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;
type FilterAction = "IN" | "OUT" | "STATUS" | "ALL";
type FilterStatus = (typeof ORDER_STATUSES)[number] | "ALL";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  return search.toString();
}

export default async function RecordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
  const [warehouses, currentUser] = await Promise.all([getWarehouses(), getSessionUser()]);
  const isAdmin = currentUser?.role.name === "ADMIN";
  const page = Math.max(1, Number(first(resolvedSearchParams.page) ?? "1") || 1);
  const filters = {
    action: (first(resolvedSearchParams.action) ?? "ALL") as FilterAction,
    warehouseId: first(resolvedSearchParams.warehouseId) ?? "ALL",
    status: (first(resolvedSearchParams.status) ?? "ALL") as FilterStatus,
    search: first(resolvedSearchParams.search) ?? "",
    from: first(resolvedSearchParams.from) ?? "",
    to: first(resolvedSearchParams.to) ?? ""
  };

  const result = await getRecordPage(filters, {
    page,
    pageSize: 20,
    includePhoto: false
  });

  const baseParams = {
    action: filters.action !== "ALL" ? filters.action : undefined,
    warehouseId: filters.warehouseId !== "ALL" ? filters.warehouseId : undefined,
    status: filters.status !== "ALL" ? filters.status : undefined,
    search: filters.search || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined
  };

  return (
    <main>
      <section className="section">
        <div className="section-head">
          <div>
            <h1 className="section-title">记录中心</h1>
            <p className="section-subtitle">按动作、仓库、状态和时间筛选，列表轻量加载，图片按需预览。</p>
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
                {STOCK_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action === "IN" ? "入库" : action === "OUT" ? "出库" : "状态变更"}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>仓库</label>
              <select name="warehouseId" defaultValue={filters.warehouseId}>
                <option value="ALL">全部</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>状态</label>
              <select name="status" defaultValue={filters.status}>
                <option value="ALL">全部</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
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
            <a className="button-secondary" href="/records" style={{ display: "inline-flex", alignItems: "center" }}>
              清空筛选
            </a>
            <span className="small muted">共 {result.total} 条记录</span>
            {!isAdmin ? <span className="small muted">当前仅可查看</span> : null}
          </div>
        </form>
      </section>

      <section className="section">
        <div className="panel list-card">
          <RecordTable records={result.items} />
          <div className="actions" style={{ padding: "16px 18px 0" }}>
            <a
              className="button-secondary"
              aria-disabled={result.page <= 1}
              href={result.page <= 1 ? "#" : `/records?${buildQuery({ ...baseParams, page: result.page - 1 })}`}
            >
              上一页
            </a>
            <span className="small muted">第 {result.page} / {result.pageCount} 页</span>
            <a
              className="button-secondary"
              aria-disabled={result.page >= result.pageCount}
              href={result.page >= result.pageCount ? "#" : `/records?${buildQuery({ ...baseParams, page: result.page + 1 })}`}
            >
              下一页
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
