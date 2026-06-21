"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, ROBOT_TYPES, OrderStatus, RobotType } from "@/lib/types";

type RobotOption = {
  id: string;
  sn: string;
  type: RobotType;
  status: OrderStatus;
  warehouseName?: string | null;
  warehouseId: string | null;
};

type WarehouseOption = {
  id: string;
  code: string;
  name: string;
};

type EditableRobotOption = RobotOption & {
  note?: string;
  warehouseId: string | null;
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

export function RobotCreationForm({ warehouses }: { warehouses: WarehouseOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            await submitJson("/api/robots", {
              sn: String(form.get("sn") ?? ""),
              type: String(form.get("type") ?? ""),
              warehouseId: String(form.get("warehouseId") ?? "") || null,
              note: String(form.get("note") ?? "")
            });
            setMessage("机器人已创建");
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
            新建机器人
          </h3>
          <p className="section-subtitle">管理者操作：为每台机器人登记 SN、类型和初始仓库。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>SN 码</label>
          <input name="sn" placeholder="例如 A3-2024-0008" required />
        </div>
        <div className="field">
          <label>机器人类型</label>
          <select name="type" defaultValue={ROBOT_TYPES[0]}>
            {ROBOT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>初始仓库</label>
          <select name="warehouseId" defaultValue="">
            <option value="">未入库</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} · {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>备注</label>
          <input name="note" placeholder="可选" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "创建机器人"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function CheckInForm({ robots, warehouses }: { robots: RobotOption[]; warehouses: WarehouseOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const availableRobots = useMemo(() => robots.filter((robot) => robot.warehouseId === null), [robots]);
  const [message, setMessage] = useState("");

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            await submitJson("/api/stock-records", {
              action: "IN",
              robotId: String(form.get("robotId") ?? ""),
              warehouseId: String(form.get("warehouseId") ?? ""),
              operatorName: String(form.get("operatorName") ?? ""),
              note: String(form.get("note") ?? "")
            });
            setMessage("入库成功");
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
            入库登记
          </h3>
          <p className="section-subtitle">管理者和二级管理员可将未入库机器人登记到指定仓库。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>机器人</label>
          <select name="robotId" required>
            <option value="">请选择</option>
            {availableRobots.map((robot) => (
              <option key={robot.id} value={robot.id}>
                {robot.sn} · {robot.type}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>目标仓库</label>
          <select name="warehouseId" required>
            <option value="">请选择</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} · {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>操作人</label>
          <input name="operatorName" required placeholder="例如 张三" />
        </div>
        <div className="field">
          <label>备注</label>
          <input name="note" placeholder="可选" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "确认入库"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function CheckOutForm({ robots }: { robots: RobotOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const busyRobots = useMemo(() => robots.filter((robot) => robot.warehouseId !== null), [robots]);

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            await submitJson("/api/stock-records", {
              action: "OUT",
              robotId: String(form.get("robotId") ?? ""),
              operatorName: String(form.get("operatorName") ?? ""),
              note: String(form.get("note") ?? "")
            });
            setMessage("出库成功");
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
            出库登记
          </h3>
          <p className="section-subtitle">机器人离开当前仓库时，操作也会写入审计记录。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>机器人</label>
          <select name="robotId" required>
            <option value="">请选择</option>
            {busyRobots.map((robot) => (
              <option key={robot.id} value={robot.id}>
                {robot.sn} · {robot.warehouseName ?? "未入库"}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>操作人</label>
          <input name="operatorName" required placeholder="例如 李四" />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>备注</label>
          <input name="note" placeholder="可选" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "确认出库"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function StatusUpdateForm({ robots }: { robots: RobotOption[] }) {
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
            await submitJson("/api/robots/status", {
              robotId: String(form.get("robotId") ?? ""),
              status: String(form.get("status") ?? ""),
              operatorName: String(form.get("operatorName") ?? ""),
              note: String(form.get("note") ?? "")
            });
            setMessage("状态已更新");
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
            状态变更
          </h3>
          <p className="section-subtitle">支持空闲、日租、月租、销售、维修、损坏、缺少配件。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>机器人</label>
          <select name="robotId" required>
            <option value="">请选择</option>
            {robots.map((robot) => (
              <option key={robot.id} value={robot.id}>
                {robot.sn} · {robot.type}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>新状态</label>
          <select name="status" required defaultValue="空闲">
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>操作人</label>
          <input name="operatorName" required placeholder="例如 王五" />
        </div>
        <div className="field">
          <label>备注</label>
          <input name="note" placeholder="可选" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "更新状态"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function RobotEditForm({ robots, warehouses }: { robots: EditableRobotOption[]; warehouses: WarehouseOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <form
      className="panel form-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const id = String(form.get("robotId") ?? "");
        startTransition(async () => {
          try {
            await submitJson(`/api/robots/${id}`, {
              sn: String(form.get("sn") ?? ""),
              type: String(form.get("type") ?? ""),
              warehouseId: String(form.get("warehouseId") ?? "") || null,
              status: String(form.get("status") ?? ""),
              note: String(form.get("note") ?? "")
            });
            setMessage("机器人已更新");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "更新失败");
          }
        });
      }}
    >
      <div className="section-head">
        <div>
          <h3 className="section-title" style={{ fontSize: 20, margin: 0 }}>
            编辑机器人
          </h3>
          <p className="section-subtitle">管理者可修改 SN、类型、状态和仓库。</p>
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>选择机器人</label>
          <select name="robotId" required defaultValue="">
            <option value="">请选择</option>
            {robots.map((robot) => (
              <option key={robot.id} value={robot.id}>
                {robot.sn} · {robot.type}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>SN 码</label>
          <input name="sn" placeholder="保留原值可不改" />
        </div>
        <div className="field">
          <label>机器人类型</label>
          <select name="type" defaultValue="">
            <option value="">保留原值</option>
            {ROBOT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>状态</label>
          <select name="status" defaultValue="">
            <option value="">保留原值</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>仓库</label>
          <select name="warehouseId" defaultValue="">
            <option value="">保留原值</option>
            <option value="none">清空仓库</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.code} · {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>备注</label>
          <input name="note" placeholder="可选" />
        </div>
      </div>
      <div className="spacer" />
      <div className="actions">
        <button className="button-primary" disabled={isPending}>
          {isPending ? "提交中..." : "保存修改"}
        </button>
        {message ? <span className="small muted">{message}</span> : null}
      </div>
    </form>
  );
}

export function RobotDeleteHint() {
  return (
    <div className="panel form-card">
      <div className="tag">维护建议</div>
      <h3 style={{ margin: "12px 0 6px" }}>删除机器人请使用列表操作</h3>
      <p className="muted" style={{ margin: 0 }}>
        管理员可以在机器人列表中对单条机器人执行删除，避免误删。
      </p>
    </div>
  );
}
