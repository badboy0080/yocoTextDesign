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
  Copy,
  Eye,
  FilePlus2,
  FileText,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import "./home.css";

const STUDIO_URL = "/studio";
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

const STEPS = [
  {
    n: "01",
    title: "Markdown 进来",
    desc: "粘贴原文或上传 txt / docx，也可以直接进工作室。",
    icon: FileText,
  },
  {
    n: "02",
    title: "公众号预览",
    desc: "AI 理清结构，立刻看到接近发表时的样子。",
    icon: Eye,
  },
  {
    n: "03",
    title: "一键复制，还能继续改",
    desc: "复制进微信编辑器，标题和正文仍可微调。",
    icon: Copy,
  },
] as const;

const PLANS = [
  { name: "试用", price: "免费", note: "限 10 次", featured: true },
  { name: "专业版", price: "¥9.9", note: "每月", featured: false },
  { name: "专业版年付", price: "¥59.9", note: "每年", featured: false },
] as const;

function trackTrialClick() {
  try {
    const track = (window as Window & { yoocoTrack?: (event: string) => void }).yoocoTrack;
    if (typeof track === "function") {
      track("trial_click");
      return;
    }
    let deviceId = "";
    try {
      deviceId = window.localStorage.getItem("yooco-device-id") || "";
    } catch {
      /* ignore */
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "trial_click", deviceId }),
      keepalive: true,
    });
  } catch {
    /* never block navigation */
  }
}

function TrialCta({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "h-12 rounded-md bg-[var(--yooco-accent)] px-7 text-base text-white hover:bg-[var(--yooco-accent-hover)]",
        className,
      )}
    >
      <a href={STUDIO_URL} onClick={trackTrialClick}>
        免费试用 10 次
        <ArrowRight />
      </a>
    </Button>
  );
}

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
    <div className="yooco-home">
      <Script src="/analytics.js" strategy="afterInteractive" />

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background">
        <div className="yooco-shell flex h-16 items-center justify-between">
          <a
            href="/"
            className="font-[family-name:var(--yooco-display)] text-xl font-semibold tracking-tight text-foreground"
          >
            Yooco
          </a>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href="#yooco-flow">三步发出去</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="#yooco-pricing">价格</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href={STUDIO_URL}>工作室</a>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="yooco-hero">
          <div className="yooco-shell mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-sm font-medium tracking-wide text-[var(--yooco-accent)]">
              Yooco
            </p>
            <h1
              lang="en"
              className="yooco-hero-title mt-5 text-[2.35rem] text-foreground sm:text-5xl lg:text-6xl"
            >
              Make a good article worth finishing.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Markdown 进 → 公众号预览 → 一键复制，还能继续改
            </p>
            <div className="mt-10">
              <TrialCta />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              无需注册，试用免费限 10 次
            </p>
          </div>
        </section>

        <section
          className="yooco-band"
          aria-labelledby="yooco-flow-heading"
          id="yooco-flow"
        >
          <div className="yooco-shell">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="yooco-flow-heading"
                className="font-[family-name:var(--yooco-display)] text-3xl font-semibold tracking-tight"
              >
                三步发出去
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                不改你的意思，只把结构和版式整理到能直接发。
              </p>
            </div>
            <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.n} className="text-center sm:text-left">
                    <div className="yooco-step-icon" aria-hidden>
                      <Icon className="size-5" />
                    </div>
                    <p className="mt-5 font-mono text-xs tracking-widest text-[var(--yooco-accent)]">
                      {step.n}
                    </p>
                    <p className="mt-2 text-lg font-medium text-foreground">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="yooco-section" aria-labelledby="yooco-start-heading">
          <div className="yooco-shell mx-auto max-w-3xl">
            <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-none">
              <CardHeader className="border-b border-border/60 px-4 py-4 sm:px-5">
                <CardTitle
                  id="yooco-start-heading"
                  className="text-sm font-medium text-muted-foreground"
                >
                  开始一篇
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pt-0">
                <label className="sr-only" htmlFor="home-article-input">
                  文章原文
                </label>
                <Textarea
                  id="home-article-input"
                  rows={8}
                  spellCheck={false}
                  placeholder="粘贴公众号原文，点「优化排版」开始"
                  value={source}
                  aria-invalid={Boolean(hint) || undefined}
                  className={cn(
                    "min-h-44 resize-y rounded-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0 sm:px-5",
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
                  variant="outline"
                >
                  {pending ? "正在打开…" : "优化排版"}
                  {!pending ? <ArrowRight /> : null}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

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
              符合条件可申请退款 · 付费可开电子普票
            </p>
          </div>
        </section>

        <section className="yooco-section">
          <div className="yooco-shell mx-auto flex max-w-2xl flex-col items-center text-center">
            <h2 className="font-[family-name:var(--yooco-display)] text-3xl font-semibold tracking-tight">
              现在就排一版看看
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              进工作室即可试用，不改你的意思。
            </p>
            <div className="mt-8">
              <TrialCta />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80">
        <div className="yooco-shell flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>Yooco</span>
          <span>符合条件可申请退款</span>
        </div>
      </footer>
    </div>
  );
}
