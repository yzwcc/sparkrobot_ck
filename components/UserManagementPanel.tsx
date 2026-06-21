"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  username: string;
  displayName: string;
  role: string;
  createdAt: string;
};

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

export function UserManagementPanel({ users }: { users: UserItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="panel list-card">
      <div className="section-head">
        <div>
          <h2 className="section-title">用户管理</h2>
          <p className="section-subtitle">普通用户可注册，管理员可将其升级或撤销为二级管理员。</p>
        </div>
        <div className="tag">仅管理员</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>昵称</th>
              <th>用户名</th>
              <th>角色</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.displayName}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleString("zh-CN")}</td>
                <td>
                  <div className="actions">
                    {user.role === "USER" ? (
                      <button
                        className="button-secondary"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            try {
                              await submitJson("/api/users/promote", { userId: user.id });
                              setMessage(`已将 ${user.username} 升级为二级管理员`);
                              router.refresh();
                            } catch (error) {
                              setMessage(error instanceof Error ? error.message : "操作失败");
                            }
                          });
                        }}
                      >
                        升级为二级管理员
                      </button>
                    ) : null}
                    {user.role === "MANAGER" ? (
                      <button
                        className="button-secondary"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            try {
                              await submitJson("/api/users/demote", { userId: user.id });
                              setMessage(`已将 ${user.username} 撤销为普通用户`);
                              router.refresh();
                            } catch (error) {
                              setMessage(error instanceof Error ? error.message : "操作失败");
                            }
                          });
                        }}
                      >
                        撤销二级管理员
                      </button>
                    ) : null}
                    {user.role === "ADMIN" ? <span className="muted small">最高权限</span> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="spacer" />
      {message ? <div className="muted small">{message}</div> : null}
    </div>
  );
}
