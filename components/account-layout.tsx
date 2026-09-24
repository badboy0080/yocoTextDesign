import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import "@/app/account.css";

export function AccountLayout({
  children,
  section,
}: {
  children: ReactNode;
  section: string;
}) {
  return (
    <div className="account-app">
      <header className="account-header">
        <div className="account-container account-header-inner">
          <Link href="/" className="account-logo" aria-label="Yooco 首页">
            <BrandLogo />
          </Link>
          <nav className="account-nav" aria-label="页面导航">
            <Link href="/works">作品</Link>
            <Link href="/subscribe">订阅</Link>
            <Link href="/login">登录</Link>
            <Link href="/works?panel=studio">工作台 <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="account-footer">
        <div className="account-container account-footer-inner">
          <span>YOOCO © 2026</span>
          <span>{section} / 你的最佳排版助理</span>
          <Link href="/">返回首页 ↗</Link>
        </div>
      </footer>
    </div>
  );
}
