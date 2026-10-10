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
import Link from "next/link";

import { EyeTracker } from "@/components/eye-tracker";
import { WorksRail } from "@/components/works-rail";
import { TRIAL_LIMIT } from "@/lib/trial-quota";
import "./home.css";

const STUDIO_URL = "/works?panel=studio";

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
  { name: "试用", price: "免费", note: `限 ${TRIAL_LIMIT} 次`, featured: true },
  { name: "专业版", price: "¥9.9", note: "每月", featured: false },
  { name: "专业版年付", price: "¥59.9", note: "每年", featured: false },
] as const;

export function HomeLanding() {
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
      <Script src="/analytics.js" strategy="afterInteractive" />
      <div className="ol-glow ol-glow-a" aria-hidden="true" />
      <div className="ol-glow ol-glow-b" aria-hidden="true" />
      <div className="ol-shell">
      <header className="ol-header">
        <Link href="/" aria-label="Yooco 首页">
          <BrandLogo onDark />
        </Link>
        <nav className="ol-nav" aria-label="页面">
          <a href="#works-heading">作品</a>
          {SHOW_PRICING ? <a href="#yooco-pricing">价格</a> : null}
          <Link href="/subscribe">订阅</Link>
          <a href={STUDIO_URL}>工作室</a>
        </nav>
        <div className="ol-header-end">
          <p className="ol-status"><span className="ol-pulse" aria-hidden="true" />STUDIO</p>
          <HomeAccountLink />
        </div>
      </header>

      <main>
        <section className="ol-hero" aria-labelledby="home-hero-title">
          <div className="ol-hero-copy">
            <p className="ol-kicker">YOOCO / LAYOUT</p>
            <h1 id="home-hero-title">
              <span className="ol-hero-line">
                <span className="ol-hero-words">好文章</span>
                <span className="ol-eye ol-float" aria-hidden="true">
                  <EyeTracker
                    shape="Bubble"
                    eyes="Slant"
                    eyeScale={1.7}
                    eyeWidth={0.85}
                    follow={72}
                    bounce={26}
                    size={72}
                    restAfter={2000}
                    near={320}
                  />
                </span>
                <span className="ol-hero-accent">值得好排版</span>
              </span>
            </h1>
          </div>
          <div className="ol-hero-panel">
            <form className="ol-composer" onSubmit={(event) => { event.preventDefault(); goTrial(); }}>
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
              </div>
            </form>
          </div>
        </section>

        <WorksRail />

        {SHOW_PRICING ? (
        <section className="ol-pricing" aria-labelledby="yooco-pricing-heading" id="yooco-pricing">
          <div className="ol-pricing-intro">
            <h2 id="yooco-pricing-heading">价格</h2>
            <p>试用免费限 {TRIAL_LIMIT} 次 / 专业版 ¥9.9/月 / ¥59.9/年</p>
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
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">粤ICP备2026141208号</a>
          {/* 公安备案号核发后，放在这个链接旁边。 */}
        </p>
      </footer>
      <p className="ol-watermark" aria-hidden="true">YOOCO</p>
      </div>
    </div>
  );
}
