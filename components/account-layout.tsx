import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { SiteThemeSwitch } from "@/components/site-theme-switch";
import "@/app/account.css";

export function AccountLayout({
  children,
  section,
  skin,
  current,
}: {
  children: ReactNode;
  section: string;
  skin?: "obsidian";
  current?: "changelog";
}) {
  const obsidian = skin === "obsidian";
  return (
    <div className={`account-app${obsidian ? " is-obsidian" : ""}`}>
      <header className="account-header">
        <div className="account-container account-header-inner">
          <Link href="/" className="account-logo studio-logo" aria-label="Yooco 首页">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="yooco-brand-bubble" src="/yooco-mark-lime.svg" alt="" width="40" height="32" />
            <span className="yooco-brand-word">Yooco</span>
          </Link>
          <nav className="account-nav" aria-label="页面导航">
            <Link href="/works">精品模板</Link>
            <Link href="/changelog" aria-current={current === "changelog" ? "page" : undefined}>更新日志</Link>
            <Link href="/studio.html">工作台 <ArrowUpRight size={14} aria-hidden="true" /></Link>
            {obsidian ? <SiteThemeSwitch /> : null}
            <AccountMenu />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="account-footer">
        <div className="account-container account-footer-inner">
          <span>YOOCO © 2026</span>
          <span>{section} / 你的最佳排版助理</span>
          <Link href="/faq">常见问题</Link>
          <Link href="/">返回首页 ↗</Link>
        </div>
      </footer>
    </div>
  );
}
