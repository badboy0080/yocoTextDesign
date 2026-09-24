"use client";

import {
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

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { HomeDotField } from "@/components/home-dot-field";
import { WorksRail } from "@/components/works-rail";
import "./home.css";

const STUDIO_URL = "/works?panel=studio";
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
  { name: "试用", price: "免费", note: "限 10 次", featured: true },
  { name: "专业版", price: "¥9.9", note: "每月", featured: false },
  { name: "专业版年付", price: "¥59.9", note: "每年", featured: false },
] as const;

export function HomeLanding() {
  const [source, setSource] = useState("");
  const [hint, setHint] = useState("");
  const [pending, startTransition] = useTransition();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function goStudio(autoOptimize: boolean) {
    startTransition(() => {
      try {
        const text = source.trim();
        if (text) localStorage.setItem("yooco-article-source", text);
        if (autoOptimize && text) localStorage.setItem("yooco-auto-optimize", "1");
      } catch {
        /* ignore quota / private mode */
      }
      window.location.assign(STUDIO_URL);
    });
  }

  function goOptimize() {
    const text = source.trim();
    if (!text) {
      setHint("请先粘贴或输入文章。");
      return;
    }
    setHint("");
    goStudio(true);
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
    <div className="yooco-home relative">
      <HomeDotField />
      <Script src="/analytics.js" strategy="afterInteractive" />

      <header className="yooco-header sticky top-0 z-20 border-b border-border/80 bg-background">
        <div className="yooco-shell flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--yooco-display)] text-xl font-semibold tracking-tight text-foreground"
          >
            <BrandLogo />
          </Link>
          <nav className="yooco-nav flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#works-heading">作品</a>
            </Button>
            {SHOW_PRICING ? (
              <Button asChild variant="ghost" size="sm">
                <a href="#yooco-pricing">价格</a>
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="sm">
              <Link href="/subscribe">订阅</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={STUDIO_URL}>工作室</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">登录</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="yooco-hero" aria-labelledby="home-hero-title">
          <div className="yooco-shell mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="yooco-hero-kicker">好文章，值得好排版</p>
            <h1 id="home-hero-title" className="yooco-hero-title">
              Best layout with AI
            </h1>
            <div className="yooco-input-wrap mt-8 w-full text-left">
              <Card className="yooco-input-card gap-0 overflow-hidden border-border/80 py-0 shadow-none">
                <CardContent className="px-0 pt-0">
                  <label className="sr-only" htmlFor="home-article-input">
                    文章原文
                  </label>
                  <Textarea
                    id="home-article-input"
                    rows={5}
                    spellCheck={false}
                    placeholder="粘贴公众号原文，点「优化排版」开始"
                    value={source}
                    aria-invalid={Boolean(hint) || undefined}
                    className={cn(
                      "min-h-32 resize-y rounded-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0 sm:px-5",
                      "placeholder:text-muted-foreground/70",
                    )}
                    onChange={(event) => {
                      setSource(event.target.value);
                      if (hint) setHint("");
                    }}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        goOptimize();
                      }
                    }}
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                  <input
                    ref={fileInputRef}
                    className="sr-only"
                    type="file"
                    accept={ACCEPT_FILES}
                    tabIndex={-1}
                    onChange={onFilePicked}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={importing || pending}
                    onClick={openFilePicker}
                    className="justify-start sm:w-auto"
                  >
                    <FilePlus2 />
                    {importing ? "读取中…" : "上传 txt / docx"}
                  </Button>
                  <div className="min-w-0 flex-1">
                    {hint ? (
                      <Alert variant="destructive" className="border-destructive/30 py-2">
                        <AlertCircle />
                        <AlertDescription>{hint}</AlertDescription>
                      </Alert>
                    ) : (
                      <p className="hidden text-xs text-muted-foreground sm:block">
                        Ctrl / ⌘ + Enter 也可提交
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="lg"
                    disabled={pending || importing}
                    onClick={goOptimize}
                    className="border-0 bg-[linear-gradient(90deg,#A9FD83,#98F68D)] text-[#17331b] shadow-none hover:brightness-95"
                  >
                    {pending ? "正在打开…" : "优化排版"}
                    {!pending ? <ArrowRight /> : null}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        <WorksRail />

        {SHOW_PRICING ? (
        <section
          className="yooco-band"
          aria-labelledby="yooco-pricing-heading"
          id="yooco-pricing"
        >
          <div className="yooco-shell">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="yooco-pricing-heading"
                className="font-[family-name:var(--yooco-display)] text-3xl font-semibold tracking-tight"
              >
                价格
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                试用免费限 10 次 / 专业版 ¥9.9/月 / ¥59.9/年
              </p>
            </div>
            <ul className="yooco-pricing-grid mt-12">
              {PLANS.map((plan) => (
                <li
                  key={plan.name}
                  className={cn("yooco-pricing-card", plan.featured && "is-featured")}
                >
                  <p className="text-sm text-muted-foreground">{plan.name}</p>
                  <p className="mt-3 font-[family-name:var(--yooco-display)] text-3xl font-semibold tracking-tight">
                    {plan.price}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
              付费可开电子普票
            </p>
          </div>
        </section>
        ) : null}
      </main>

      <footer className="relative z-10 border-t border-border/80 bg-background">
        <div className="yooco-shell flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <BrandLogo compact />
          <span>你的最佳排版助理</span>
        </div>
      </footer>
    </div>
  );
}
