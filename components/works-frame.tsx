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

export function WorksFrame() {
  const router = useRouter();
  const params = useSearchParams();
  const [panel, setPanel] = useState<Panel>(params.get("panel") === "studio" ? "studio" : "works");
  const [collapsed, setCollapsed] = useState(false);
  const [studioReady, setStudioReady] = useState(panel === "studio");

  useEffect(() => {
    setPanel(params.get("panel") === "studio" ? "studio" : "works");
  }, [params]);

  useEffect(() => {
    if (panel === "studio") setStudioReady(true);
  }, [panel]);

  useEffect(() => {
    setCollapsed(localStorage.getItem("yooco-works-side") === "collapsed");
  }, []);

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
        <a className="works-logo" href="/" aria-label="Yooco 首页">
          <BrandLogo />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="works-mark" src="/yooco-mark.svg" width="32" height="32" alt="" />
        </a>
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
        <button className="works-fold" type="button" aria-pressed={collapsed} aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"} onClick={toggleSide}>
          <IconFold collapsed={collapsed} />
          <span>{collapsed ? "展开" : "折叠"}</span>
        </button>
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
