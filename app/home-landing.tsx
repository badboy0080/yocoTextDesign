"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { AlertCircle, ArrowRight, FilePlus2, Sparkles } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import "./home.css";

const STUDIO_URL = "/studio.html";
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
  { n: "01", title: "粘贴原文", desc: "把公众号草稿贴进来，或上传 txt / docx。" },
  { n: "02", title: "优化排版", desc: "AI 理清结构，并给出一套可读的样式基调。" },
  { n: "03", title: "复制发布", desc: "一键复制到微信编辑器，再微调即可发出。" },
] as const;

export function HomeLanding() {
  const [source, setSource] = useState("");
  const [hint, setHint] = useState("");
  const [pending, startTransition] = useTransition();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function goOptimize() {
    const text = source.trim();
    if (!text) {
      setHint("请先粘贴或输入文章。");
      return;
    }
    setHint("");
    startTransition(() => {
      try {
        localStorage.setItem("yooco-article-source", text);
        localStorage.setItem("yooco-auto-optimize", "1");
      } catch {
        /* ignore quota / private mode */
      }
      window.location.assign(STUDIO_URL);
    });
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
      <div className="yooco-home-wash" aria-hidden="true" />

      <header className="relative z-10 flex h-14 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur-sm sm:px-8">
        <a
          href="/"
          className="font-[family-name:var(--yooco-display)] text-xl font-semibold tracking-tight text-foreground"
        >
          Yooco
        </a>
        <Button asChild variant="ghost" size="sm">
          <a href={STUDIO_URL}>工作室</a>
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
        <section className="flex flex-col gap-8">
          <div className="space-y-4 text-center sm:text-left">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              公众号排版实验室
            </p>
            <h1 className="font-[family-name:var(--yooco-display)] text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Yooco
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
              粘贴原文，一键优化排版，复制进微信编辑器。
            </p>
          </div>

          <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-sm">
            <CardHeader className="border-b border-border/60 px-4 py-3 sm:px-5">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-4 text-[var(--yooco-accent)]" aria-hidden />
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
            <CardFooter className="flex flex-col items-stretch gap-3 border-t border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
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
                className="bg-[var(--yooco-accent)] text-white hover:bg-[var(--yooco-accent-hover)]"
              >
                {pending ? "正在打开…" : "优化排版"}
                {!pending ? <ArrowRight /> : null}
              </Button>
            </CardFooter>
          </Card>
        </section>

        <Separator className="my-12 bg-border/70" />

        <section className="space-y-6" aria-labelledby="yooco-flow-heading">
          <div className="space-y-2">
            <h2
              id="yooco-flow-heading"
              className="font-[family-name:var(--yooco-display)] text-2xl font-semibold tracking-tight"
            >
              三步发出去
            </h2>
            <p className="text-sm text-muted-foreground">
              不改你的意思，只把结构和版式整理到能直接发。
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n} className="space-y-2">
                <p className="font-mono text-xs tracking-widest text-[var(--yooco-accent)]">
                  {step.n}
                </p>
                <p className="text-base font-medium text-foreground">{step.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
