"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "@/app/works.css";
import { BrandLogo } from "@/components/brand-logo";
import { InviteModal } from "@/components/invite-modal";
import { WorksGallery } from "@/components/works-gallery";

function IconStudio() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 12.5 8.2 3.8 13 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.2 9.2h5.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.2" y="2.4" width="11.6" height="11.2" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.4v11.2M2.2 6.4h11.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconWorks() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.2" y="2.2" width="4.8" height="4.8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="2.2" width="4.8" height="4.8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2.2" y="9" width="4.8" height="4.8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="4.8" height="4.8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconFold({ collapsed }: { collapsed: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.2" y="2.5" width="11.6" height="11" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 2.5v11" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d={collapsed ? "M8.4 6.2 10.6 8 8.4 9.8" : "M10.2 6.2 8 8l2.2 1.8"} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const AVATAR_COLORS = ["#5c8a22", "#3d6cb5", "#c47a24", "#c45c78", "#2f8f86", "#7a52b8"];

function avatarColor(email: string) {
  const sum = [...email].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const INVITE_GIFT_LABEL = "邀请赢积分";
const INVITE_GIFT_TIP = "邀请好友，双方各 +5 积分";

function InviteGiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect className="invite-gift-box" x="4.1" y="11" width="15.8" height="8.5" rx="1.4" />
      <rect className="invite-gift-lid" x="3.2" y="8.15" width="17.6" height="3.05" rx="0.85" />
      <rect className="invite-gift-ribbon" x="10.85" y="8.15" width="2.3" height="11.35" />
      <path className="invite-gift-ribbon" d="M12 8.2c-1.35-2.15-3.55-2.85-4.55-1.75-.85.95-.35 2.25 1.05 2.55 1.15.25 2.45-.15 3.5-.8z" />
      <path className="invite-gift-ribbon" d="M12 8.2c1.35-2.15 3.55-2.85 4.55-1.75.85.95.35 2.25-1.05 2.55-1.15.25-2.45-.15-3.5-.8z" />
    </svg>
  );
}

export function WorksFrame() {
  const params = useSearchParams();
  const legacyStudio = params.get("panel") === "studio";
  const [collapsed, setCollapsed] = useState(false);
  const [account, setAccount] = useState<{ email: string; name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (legacyStudio) window.location.replace("/studio.html");
  }, [legacyStudio]);

  useEffect(() => {
    setCollapsed(localStorage.getItem("yooco-works-side") === "collapsed");
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json() as { email?: string; name?: string };
        if (!data.email) return null;
        return { email: data.email, name: data.name || data.email };
      })
      .then((next) => {
        if (!cancelled) setAccount(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(".works-account")) return;
      setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggleSide = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("yooco-works-side", next ? "collapsed" : "open");
      return next;
    });
  };

  if (legacyStudio) return null;

  return (
    <div className={`works-app${collapsed ? " is-side-collapsed" : ""}`}>
      <aside className="works-side">
        <div className="works-brand-row">
          <a className="works-logo" href="/" aria-label="Yooco 首页">
            <BrandLogo onDark />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="works-mark" src="/yooco-mark-lime.svg" width="36" height="29" alt="" />
          </a>
          <button className="works-fold" type="button" aria-pressed={collapsed} aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"} onClick={toggleSide}>
            <IconFold collapsed={collapsed} />
          </button>
        </div>
        <nav className="works-nav" aria-label="页面">
          <a href="/studio.html" aria-label="工作台">
            <IconStudio />
            <span>工作台</span>
          </a>
          <a href="/layout.html" aria-label="智能排版">
            <IconLayout />
            <span>智能排版</span>
          </a>
          <a href="/works" aria-label="精品模板" className="is-active" aria-current="page">
            <IconWorks />
            <span>精品模板</span>
          </a>
        </nav>
        {account ? (
          <div className="works-account">
            <div className="works-account-person">
              <div className="invite-gift-row">
                <button
                  type="button"
                  className="invite-gift"
                  title={INVITE_GIFT_TIP}
                  aria-label={INVITE_GIFT_TIP}
                  onClick={() => { setMenuOpen(false); setInviteOpen(true); }}
                >
                  <InviteGiftIcon />
                </button>
                <span className="invite-gift-label">{INVITE_GIFT_LABEL}</span>
              </div>
              <span className="works-avatar" style={{ ["--avatar-color" as string]: avatarColor(account.email) }} aria-hidden="true">
                <svg viewBox="0 0 160 120">
                  <path d="M16 57C16 24 41 11 78 11C118 11 143 23 143 57C143 82 128 101 103 112C96 115 93 113 96 105C100 92 90 93 77 94C39 98 16 84 16 57Z" fill="currentColor" />
                  <g fill="#20251F">
                    <ellipse cx="61" cy="57" rx="7.5" ry="14" />
                    <ellipse cx="97" cy="57" rx="7.5" ry="14" />
                  </g>
                </svg>
              </span>
            </div>
            <span className="works-account-copy">
              <strong title={account.email}>{account.name}</strong>
              <small>免费版</small>
            </span>
            <div className="works-account-menu">
              <button type="button" className="works-account-more" aria-haspopup="menu" aria-expanded={menuOpen} aria-label="账号菜单" onClick={() => setMenuOpen((open) => !open)}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
                </svg>
              </button>
              {menuOpen ? (
                <div className="works-account-popover" role="menu">
                  <button type="button" role="menuitem" onClick={() => setMenuOpen(false)}>个人信息</button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      location.href = "/login";
                    }}
                  >
                    退出登录
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
      <div className="works-main">
        <div className="works-view">
          <WorksGallery />
        </div>
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
