"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckInForm, CheckOutForm, StatusUpdateForm } from "@/components/RobotForms";
import { OrderStatus, RobotType } from "@/lib/types";

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

type TabKey = "in" | "out" | "status";

function readStoredTab() {
  if (typeof window === "undefined") return "in" as TabKey;
  const value = window.localStorage.getItem("sparkrobot.quick.tab");
  return value === "out" || value === "status" ? value : "in";
}

function storeTab(tab: TabKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sparkrobot.quick.tab", tab);
}

export function QuickActionDrawer({
  robots,
  warehouses
}: {
  robots: RobotOption[];
  warehouses: WarehouseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("in");

  useEffect(() => {
    setTab(readStoredTab());
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const currentTitle = useMemo(() => {
    if (tab === "out") return "出库登记";
    if (tab === "status") return "状态变更";
    return "入库登记";
  }, [tab]);

  const switchTab = (nextTab: TabKey) => {
    setTab(nextTab);
    storeTab(nextTab);
  };

  return (
    <>
      <button className="button-primary" type="button" onClick={() => setOpen(true)}>
        打开快速出入库
      </button>

      {open ? (
        <div className="drawer-backdrop" onClick={() => setOpen(false)} role="presentation">
          <aside className="drawer-panel" onClick={(event) => event.stopPropagation()} aria-label="快速出入库抽屉">
            <div className="drawer-head">
              <div>
                <div className="tag">高频操作区</div>
                <h2 className="drawer-title">{currentTitle}</h2>
                <p className="drawer-subtitle">统一处理入库、出库和状态更新，减少页面切换。</p>
              </div>
              <button className="button-secondary" type="button" onClick={() => setOpen(false)}>
                关闭
              </button>
            </div>

            <div className="drawer-tabs">
              <button className={tab === "in" ? "drawer-tab active" : "drawer-tab"} type="button" onClick={() => switchTab("in")}>
                入库
              </button>
              <button className={tab === "out" ? "drawer-tab active" : "drawer-tab"} type="button" onClick={() => switchTab("out")}>
                出库
              </button>
              <button className={tab === "status" ? "drawer-tab active" : "drawer-tab"} type="button" onClick={() => switchTab("status")}>
                状态
              </button>
            </div>

            <div className="drawer-body">
              {tab === "in" ? <CheckInForm robots={robots} warehouses={warehouses} /> : null}
              {tab === "out" ? <CheckOutForm robots={robots} /> : null}
              {tab === "status" ? <StatusUpdateForm robots={robots} /> : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
