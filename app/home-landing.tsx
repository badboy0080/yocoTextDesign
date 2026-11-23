"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import Script from "next/script";
import {
  AlertCircle,
  ArrowRight,
  FilePlus2,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { HomeFaq } from "@/components/home-faq";
import { HeroBook, HomeShowcase } from "@/components/home-showcase";
import { SiteThemeSwitch } from "@/components/site-theme-switch";
import Link from "next/link";

import { TRIAL_LIMIT } from "@/lib/trial-quota";
import { shiftStyle, useHomeParallax } from "@/components/home-parallax";
import "./home.css";
import "./home-shell.css";
import "./home-book.css";

const STUDIO_URL = "/studio.html";

function HomeAccountLink() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { email?: string };
        if (data?.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  if (!email) {
    return (
      <Link className="ol-login" href="/login">登录</Link>
    );
  }

  return (
    <>
      <span className="ol-account" title={email}>{email}</span>
      <button className="ol-login" type="button" onClick={logout}>退出</button>
    </>
  );
}
const ACCEPT_FILES =
  ".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isTxt(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".txt") || file.type === "text/plain";
}

function isDocx(file: File) {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

async function readArticleFile(file: File): Promise<string> {
  if (isTxt(file)) {
    return file.text();
  }
  if (isDocx(file)) {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  }
  throw new Error("unsupported");
}

const SHOW_PRICING = false;

const PLANS = [
  { name: "试用", price: "免费", note: `限 ${TRIAL_LIMIT} 积分`, featured: true },
  { name: "专业版", price: "¥9.9", note: "每月", featured: false },
  { name: "专业版年付", price: "¥59.9", note: "每年", featured: false },
] as const;

export function HomeLanding() {
  useHomeParallax();
  const [source, setSource] = useState("");
  const [hint, setHint] = useState("");
  const [pending, startTransition] = useTransition();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function trackTrialClick() {
    try {
      const track = (window as Window & { yoocoTrack?: (event: string) => void }).yoocoTrack;
      if (typeof track === "function") {
        track("trial_click");
        return;
      }
    } catch {
      /* fall through to a direct beacon */
    }
    try {
      const deviceId = window.localStorage.getItem("yooco-device-id") || "";
      const body = JSON.stringify({ event: "trial_click", deviceId });
      if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "text/plain;charset=UTF-8" }),
        );
        if (sent) return;
      }
      void fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    } catch {
      /* analytics must not block entry */
    }
  }

  function readSource() {
    const field = document.getElementById("home-article-input");
    if (field instanceof HTMLTextAreaElement) return field.value;
    return source;
  }

  function goStudio(autoOptimize: boolean) {
    startTransition(() => {
      try {
        const text = readSource().trim();
        if (text) localStorage.setItem("yooco-article-source", text);
        if (autoOptimize && text) localStorage.setItem("yooco-auto-optimize", "1");
        else localStorage.removeItem("yooco-auto-optimize");
      } catch {
        /* ignore quota / private mode */
      }
      trackTrialClick();
      window.location.assign(STUDIO_URL);
    });
  }

  function goTrial() {
    setHint("");
    goStudio(Boolean(readSource().trim()));
  }

  function openFilePicker() {
    if (importing) return;
    fileInputRef.current?.click();
  }

  async function onFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isTxt(file) && !isDocx(file)) {
      setHint("目前只支持 .txt 和 .docx，其它格式稍后支持。");
      return;
    }

    setImporting(true);
    setHint("");
    try {
      const text = (await readArticleFile(file)).trim();
      if (!text) {
        setHint("文件里没有可读文字，请换一份再试。");
        return;
      }
      setSource(text);
    } catch {
      setHint("文件读取失败，请确认是正常的 .txt 或 .docx。");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="ol-home">
      <div className="ol-depth" aria-hidden="true">
        <div className="ol-depth-far" />
        <div className="ol-depth-mid">册</div>
      </div>
      <Script src="/analytics.js" strategy="afterInteractive" />
      <div className="ol-shell">
      <div className="ol-screen">
      <header className="ol-header">
        <Link href="/" aria-label="Yooco 首页">
          <BrandLogo onDark />
        </Link>
        <nav className="ol-nav" aria-label="页面">
          <a href="#theme-shelf">精品模板</a>
          <Link href="/changelog">更新日志</Link>
          {SHOW_PRICING ? <a href="#yooco-pricing">价格</a> : null}
          <a href={STUDIO_URL}>工作室</a>
        </nav>
        <div className="ol-header-end">
          <SiteThemeSwitch />
          <HomeAccountLink />
        </div>
      </header>

      <main>
        <section className="bk-hero" data-parallax aria-labelledby="home-hero-title">
          <div className="bk-hero-copy bk-shift" style={shiftStyle(-150)}>
            <p className="bk-brand">Yooco · 好文章值得好排版</p>
            <p className="bk-kicker">给公众号作者的排版工具</p>
            <h1 id="home-hero-title">
              <span className="bk-line"><span>把文章</span></span>
              <span className="bk-line"><span className="bk-accent">做成一份好看的稿。</span></span>
            </h1>
            <p className="bk-lead">贴上原文，选一个主题。预览里看到的，就是复制到公众号的样子。</p>
          </div>
          <div className="bk-hero-book">
            <div className="bk-shift" style={shiftStyle(230)}>
              <HeroBook />
            </div>
          </div>
          <form id="home-trial-form" className="ol-composer bk-shift" style={shiftStyle(-70)} onSubmit={(event) => { event.preventDefault(); goTrial(); }}>
              <label className="sr-only" htmlFor="home-article-input">文章原文</label>
              <textarea
                id="home-article-input"
                rows={6}
                spellCheck={false}
                placeholder="粘贴公众号原文，点「免费试用」进入工作台"
                value={source}
                aria-invalid={Boolean(hint) || undefined}
                onChange={(event) => {
                  setSource(event.target.value);
                  if (hint) setHint("");
                }}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                    event.preventDefault();
                    goTrial();
                  }
                }}
              />
              <div className="ol-composer-bar">
                <input
                  ref={fileInputRef}
                  className="sr-only"
                  type="file"
                  accept={ACCEPT_FILES}
                  tabIndex={-1}
                  onChange={onFilePicked}
                />
                <button type="button" className="ol-upload" disabled={importing || pending} onClick={openFilePicker}>
                  <FilePlus2 size={16} aria-hidden="true" />
                  {importing ? "读取中…" : "上传 txt / docx"}
                </button>
                <p className={hint ? "ol-hint is-error" : "ol-hint"} role={hint ? "alert" : undefined}>
                  {hint ? <><AlertCircle size={14} aria-hidden="true" />{hint}</> : "贴了文章会带进工作台"}
                </p>
                <button type="submit" className="ol-primary" disabled={pending || importing}>
                  {pending ? "正在打开…" : "免费试用"}
                  {!pending ? <ArrowRight size={18} aria-hidden="true" /> : null}
                </button>
                <a className="ol-secondary" href="#piece-01">看样稿</a>
              </div>
            </form>
        </section>
        <button
          type="button"
          className="ol-skip"
          onClick={() => document.documentElement.classList.remove("yooco-enter")}
        >
          跳过
        </button>
        <HomeShowcase />

        {SHOW_PRICING ? (
        <section className="ol-pricing" aria-labelledby="yooco-pricing-heading" id="yooco-pricing">
          <div className="ol-pricing-intro">
            <h2 id="yooco-pricing-heading">价格</h2>
            <p>试用免费限 {TRIAL_LIMIT} 积分 / 专业版 ¥9.9/月 / ¥59.9/年</p>
          </div>
          <ul className="ol-pricing-grid">
            {PLANS.map((plan) => (
              <li key={plan.name} className={plan.featured ? "is-featured" : undefined}>
                <p>{plan.name}</p>
                <strong>{plan.price}</strong>
                <span>{plan.note}</span>
              </li>
            ))}
          </ul>
          <p className="ol-pricing-note">付费可开电子普票</p>
          <p className="ol-pricing-note">符合条件可申请退款</p>
        </section>
        ) : null}
      </main>

      <footer className="ol-footer">
        <div className="ol-footer-row">
          <BrandLogo onDark compact />
          <span>你的最佳排版助理</span>
          <a className="ol-footer-link" href={STUDIO_URL}>进入工作台</a>
          <span className="ol-copy">YOOCO © 2026</span>
        </div>
        <p className="ol-beian">
          <Link href="/faq">常见问题</Link>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">粤ICP备2026141208号</a>
          {/* 公安备案号核发后，放在这个链接旁边。 */}
        </p>
      </footer>
      <p className="ol-watermark" aria-hidden="true">YOOCO</p>
      </div>
      <HomeFaq />
      </div>
      <form className="ol-dock" onSubmit={(event) => { event.preventDefault(); goTrial(); }}>
        <label className="sr-only" htmlFor="home-article-dock">文章原文</label>
        <textarea
          id="home-article-dock"
          rows={1}
          spellCheck={false}
          placeholder="粘贴原文，免费试用"
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            if (hint) setHint("");
          }}
        />
        <button type="submit" className="ol-primary" disabled={pending || importing}>
          {pending ? "正在打开…" : "免费试用"}
        </button>
      </form>
    </div>
  );
}
