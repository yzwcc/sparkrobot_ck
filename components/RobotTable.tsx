 "use client";

import { StatusPill } from "@/components/StatusPill";
import { Robot } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

async function submitJson(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const json = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(json?.error || "提交失败");
  }
  return json;
}

export function RobotTable({
  robots,
  canManage = false
}: {
  robots: Array<Robot & { warehouseName?: string | null }>;
  canManage?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!robots.length) {
    return <div className="empty">当前没有机器人数据</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th>类型</th>
            <th>仓库</th>
            <th>状态</th>
            <th>备注</th>
            <th>更新时间</th>
            {canManage ? <th>操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {robots.map((robot) => (
            <tr key={robot.id}>
              <td>{robot.sn}</td>
              <td>{robot.type}</td>
              <td>{robot.warehouseName ?? "未入库"}</td>
              <td>
                <StatusPill status={robot.status} />
              </td>
              <td>{robot.note || "-"}</td>
              <td>{new Date(robot.updatedAt).toLocaleString("zh-CN")}</td>
              {canManage ? (
                <td>
                  <div className="actions">
                    <button
                      className="button-secondary"
                      disabled={isPending}
                      onClick={() => {
                        const nextSn = prompt("请输入新的SN码", robot.sn);
                        if (nextSn === null) {
                          return;
                        }
                        startTransition(async () => {
                          try {
                            await submitJson(`/api/robots/${robot.id}`, "PATCH", { sn: nextSn });
                            setMessage("已更新");
                            router.refresh();
                          } catch (error) {
                            setMessage(error instanceof Error ? error.message : "更新失败");
                          }
                        });
                      }}
                    >
                      编辑SN
                    </button>
                    <button
                      className="button-secondary"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`确定删除机器人 ${robot.sn} 吗？`)) {
                          return;
                        }
                        startTransition(async () => {
                          try {
                            await submitJson(`/api/robots/${robot.id}`, "DELETE");
                            setMessage("已删除");
                            router.refresh();
                          } catch (error) {
                            setMessage(error instanceof Error ? error.message : "删除失败");
                          }
                        });
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {message ? <div className="small muted" style={{ padding: "12px 16px" }}>{message}</div> : null}
    </div>
  );
}
