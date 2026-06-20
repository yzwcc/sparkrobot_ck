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

export function LoginPanel({ currentUser }: { currentUser: { displayName: string; role: string } | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (currentUser) {
    return (
      <div className="panel form-card">
        <div className="row">
          <div>
            <div className="tag">已登录</div>
            <h3 style={{ margin: "12px 0 6px" }}>{currentUser.displayName}</h3>
            <div className="muted small">{currentUser.role}</div>
          </div>
          <button
            className="button-secondary"
            onClick={() => {
              startTransition(async () => {
                await submitJson("/api/auth/logout", {});
                router.refresh();
              });
            }}
          >
            退出
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            await submitJson("/api/auth/login", {
              username: String(form.get("username") ?? ""),
              password: String(form.get("password") ?? "")
            });
            setMessage("登录成功");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "登录失败");
          }
        });
      }}
    >
      <div className="section-head">
        <div>
          <h3 className="section-title" style={{ fontSize: 20, margin: 0 }}>
            登录
          </h3>
          <p className="section-subtitle">默认管理员账号可先用于系统初始化。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>用户名</label>
          <input name="username" defaultValue="admin" required />
        </div>
        <div className="field">
          <label>密码</label>
          <input name="password" type="password" defaultValue="admin123" required />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "登录中..." : "登录"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

