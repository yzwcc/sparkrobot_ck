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
  const [showRegister, setShowRegister] = useState(false);
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

  if (showRegister) {
    return (
      <form
        className="panel form-card"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            try {
              await submitJson("/api/auth/register", {
                username: String(form.get("username") ?? ""),
                password: String(form.get("password") ?? ""),
                displayName: String(form.get("displayName") ?? "")
              });
              setMessage("注册成功，请直接登录");
              setShowRegister(false);
              router.refresh();
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "注册失败");
            }
          });
        }}
      >
        <div className="section-head">
          <div>
            <h3 className="section-title" style={{ fontSize: 20, margin: 0 }}>
              注册普通用户
            </h3>
            <p className="section-subtitle">所有人都可以注册，默认权限为普通用户。</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>昵称</label>
            <input name="displayName" required placeholder="例如 张三" />
          </div>
          <div className="field">
            <label>用户名</label>
            <input name="username" required placeholder="例如 zhangsan" />
          </div>
          <div className="field">
            <label>密码</label>
            <input name="password" type="password" required placeholder="至少 6 位" />
          </div>
          <div className="field">
            <label>提示</label>
            <input disabled value="注册后即为普通用户" />
          </div>
        </div>
        <div className="spacer" />
        <div className="actions">
          <button className="button-primary" disabled={isPending}>
            {isPending ? "注册中..." : "创建账户"}
          </button>
          <button type="button" className="button-secondary" onClick={() => setShowRegister(false)}>
            返回登录
          </button>
          {message ? <span className="small muted">{message}</span> : null}
        </div>
      </form>
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
          <p className="section-subtitle">管理员、二级管理员和普通用户都在这里登录。</p>
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
        <button type="button" className="button-secondary" onClick={() => setShowRegister(true)}>
          注册账号
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}
