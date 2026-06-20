"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

async function submitJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
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
            await submitJson("/api/warehouses", {
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
          <p className="section-subtitle">管理员操作：适合添加分仓、维修仓和周转仓。</p>
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
