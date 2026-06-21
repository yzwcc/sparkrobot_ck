"use client";

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

export function WarehouseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            await submitJson("/api/warehouses", "POST", {
              code: String(form.get("code") ?? ""),
              name: String(form.get("name") ?? ""),
              location: String(form.get("location") ?? "")
            });
            setMessage("仓库已创建");
            event.currentTarget.reset();
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "提交失败");
          }
        });
      }}
    >
      <div className="section-head">
        <div>
          <h3 className="section-title" style={{ fontSize: 20, margin: 0 }}>
            新建仓库
          </h3>
          <p className="section-subtitle">系统管理员可以新增仓库、周转仓或维修仓。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>仓库编码</label>
          <input name="code" required placeholder="例如 WH-D" />
        </div>
        <div className="field">
          <label>仓库名称</label>
          <input name="name" required placeholder="例如 华南仓" />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>地址</label>
          <input name="location" required placeholder="例如 深圳市龙岗区" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "创建仓库"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function WarehouseAdminPanel({
  code,
  name,
  location,
  robotCount
}: {
  code: string;
  name: string;
  location: string;
  robotCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <div className="panel form-card">
      <div className="section-head">
        <div>
          <h3 className="section-title" style={{ fontSize: 20, margin: 0 }}>
            管理员操作
          </h3>
          <p className="section-subtitle">可以修改仓库名称和地址，也可以删除整个仓库。</p>
        </div>
        <div className="tag">仅管理员</div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            try {
              await submitJson(`/api/warehouses/${code}`, "PATCH", {
                name: String(form.get("name") ?? ""),
                location: String(form.get("location") ?? "")
              });
              setMessage("仓库信息已更新");
              router.refresh();
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "更新失败");
            }
          });
        }}
      >
        <div className="form-grid">
          <div className="field">
            <label>仓库编码</label>
            <input value={code} disabled readOnly />
          </div>
          <div className="field">
            <label>当前机器人数量</label>
            <input value={String(robotCount)} disabled readOnly />
          </div>
          <div className="field">
            <label>仓库名称</label>
            <input name="name" defaultValue={name} required />
          </div>
          <div className="field">
            <label>仓库地址</label>
            <input name="location" defaultValue={location} required />
          </div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="button-primary" disabled={isPending}>
            {isPending ? "保存中..." : "保存仓库信息"}
          </button>
        </div>
      </form>

      <div className="danger-box">
        <strong>删除仓库</strong>
        <p className="muted" style={{ margin: "8px 0 0" }}>
          删除后，该仓库下当前绑定的机器人会变成未入库状态，历史记录会保留但仓库引用会清空。
        </p>
        <div className="spacer" />
        <button
          className="button-secondary danger-button"
          disabled={isPending}
          onClick={() => {
            if (!confirm(`确定删除仓库 ${code} 吗？此操作不可撤销。`)) return;
            startTransition(async () => {
              try {
                await submitJson(`/api/warehouses/${code}`, "DELETE");
                router.push("/warehouses");
                router.refresh();
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "删除失败");
              }
            });
          }}
        >
          {isPending ? "处理中..." : "删除仓库"}
        </button>
      </div>

      {message ? <div className="small muted" style={{ marginTop: 12 }}>{message}</div> : null}
    </div>
  );
}
