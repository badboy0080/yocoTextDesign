"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/app/works.css";
import { BrandLogo } from "@/components/brand-logo";
import { WorksGallery } from "@/components/works-gallery";

type Panel = "works" | "studio";

function IconStudio() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 12.5 8.2 3.8 13 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.2 9.2h5.6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

export function WorksFrame() {
  const router = useRouter();
  const params = useSearchParams();
  const [panel, setPanel] = useState<Panel>(params.get("panel") === "studio" ? "studio" : "works");
  const [collapsed, setCollapsed] = useState(false);
  const [studioReady, setStudioReady] = useState(panel === "studio");
  const [account, setAccount] = useState<{ email: string; name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPanel(params.get("panel") === "studio" ? "studio" : "works");
  }, [params]);

  useEffect(() => {
    if (panel === "studio") setStudioReady(true);
  }, [panel]);

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

  const choose = (next: Panel) => {
    setPanel(next);
    router.replace(next === "studio" ? "/works?panel=studio" : "/works", { scroll: false });
  };

  const toggleSide = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("yooco-works-side", next ? "collapsed" : "open");
      return next;
    });
  };

  return (
    <div className={`works-app${collapsed ? " is-side-collapsed" : ""}`}>
      <aside className="works-side">
        <div className="works-brand-row">
          <a className="works-logo" href="/" aria-label="Yooco 首页">
            <BrandLogo />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="works-mark" src="/yooco-mark.svg" width="32" height="32" alt="" />
          </a>
          <button className="works-fold" type="button" aria-pressed={collapsed} aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"} onClick={toggleSide}>
            <IconFold collapsed={collapsed} />
          </button>
        </div>
        <nav className="works-nav" aria-label="页面">
          <button type="button" aria-label="工作台" className={panel === "studio" ? "is-active" : ""} aria-current={panel === "studio" ? "page" : undefined} onClick={() => choose("studio")}>
            <IconStudio />
            <span>工作台</span>
          </button>
          <button type="button" aria-label="作品" className={panel === "works" ? "is-active" : ""} aria-current={panel === "works" ? "page" : undefined} onClick={() => choose("works")}>
            <IconWorks />
            <span>作品</span>
          </button>
        </nav>
        {account ? (
          <div className="works-account">
            <span className="works-avatar" style={{ ["--avatar-color" as string]: avatarColor(account.email) }} aria-hidden="true">
              <svg viewBox="0 0 160 120">
                <path d="M16 57C16 24 41 11 78 11C118 11 143 23 143 57C143 82 128 101 103 112C96 115 93 113 96 105C100 92 90 93 77 94C39 98 16 84 16 57Z" fill="currentColor" />
                <g fill="#20251F">
                  <ellipse cx="61" cy="57" rx="7.5" ry="14" />
                  <ellipse cx="97" cy="57" rx="7.5" ry="14" />
                </g>
              </svg>
            </span>
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
        <div className="works-view" hidden={panel !== "works"}>
          <WorksGallery />
        </div>
        <div className="works-view works-studio-view" hidden={panel !== "studio"}>
          {studioReady ? <iframe className="works-studio-frame" title="工作台" src="/studio.html" /> : null}
        </div>
      </div>
    </div>
  );
}
