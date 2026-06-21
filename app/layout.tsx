import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SparkRobot 仓库管理系统",
  description: "用于管理机器人出入库、仓库归属、订单状态与操作审计的可视化系统。"
};

const navItems = [
  { href: "/", label: "总览" },
  { href: "/robots", label: "机器人" },
  { href: "/warehouses", label: "仓库" },
  { href: "/records", label: "记录" },
  { href: "/users", label: "用户" }
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              <Image src="/brand.svg" alt="SparkRobot" width={136} height={52} className="brand-image" priority />
              <span>
                <div>SparkRobot 仓库管理系统</div>
                <div className="muted small">Robot warehouse visual control</div>
              </span>
            </Link>
            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
