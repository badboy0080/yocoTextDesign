"use client";

import { useEffect, useRef, useState } from "react";
import {
  SHOWCASE_BEATS,
  SHOWCASE_THEMES,
  excerptPieces,
  type ShowcaseThemeId,
} from "@/lib/showcase-story";
import type { SampleTry } from "@/lib/load-sample-try";

function ThemeSheet({
  title,
  html,
  themeId,
}: {
  title: string;
  html: string;
  themeId: ShowcaseThemeId;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const theme = SHOWCASE_THEMES[themeId];

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    root.innerHTML = "";
    let cancelled = false;
    const style = document.createElement("style");
    style.textContent = ":host{display:block}.article-page{max-width:100%;box-sizing:border-box;background:var(--page-color,#fff)}.article-content,.article-page h2{overflow-wrap:anywhere}";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/styles.css?v=texture-plain-v1";
    const article = document.createElement("article");
    article.className = "article-page";
    article.setAttribute("style", theme.style);
    Object.entries(theme.dataset).forEach(([key, value]) => {
      article.dataset[key] = value;
    });
    article.style.backgroundColor = theme.pageColor;
    const heading = document.createElement("h2");
    heading.textContent = title;
    const body = document.createElement("div");
    body.className = "article-content";
    body.innerHTML = html;
    article.append(heading, body);
    root.append(style, link, article);
    const show = () => {
      if (!cancelled) setLive(true);
    };
    if (link.sheet) show();
    link.addEventListener("load", show);
    link.addEventListener("error", () => {
      if (!cancelled) setLive(false);
    });
    return () => {
      cancelled = true;
    };
  }, [html, theme, title]);

  return (
    <div className="story-live" data-live={live ? "1" : "0"}>
      <article className="story-fallback" style={{ background: theme.pageColor, color: theme.textColor }}>
        <h3>{title}</h3>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <div ref={hostRef} className="story-host" />
    </div>
  );
}

export function HomeStory({ sample }: { sample: SampleTry }) {
  const pieces = excerptPieces(sample.html);
  const excerpt = pieces.map((piece) => piece.html).join("");

  return (
    <section className="ol-story" id="works-heading" aria-labelledby="home-story-title">
      <div className="story-intro">
        <h2 id="home-story-title">同一篇，从原稿到换皮肤</h2>
        <p>往下是工作台示例《{sample.title}》。先看密排原文，再展开成清氧绿成稿，然后只换皮成深空青。字是同一篇，没有另编客户和数字。</p>
      </div>
      {SHOWCASE_BEATS.map((beat) => (
        <article className="story-beat" id={`story-${beat.id}`} key={beat.id} aria-labelledby={`story-${beat.id}-title`}>
          <p className="story-kicker">{beat.kicker}</p>
          <h3 id={`story-${beat.id}-title`}>{beat.title}</h3>
          {beat.kind === "manuscript" ? (
            <div className="story-manuscript">
              {pieces.map((piece) => (
                <p key={piece.index}>{piece.text}</p>
              ))}
            </div>
          ) : (
            <ThemeSheet title={sample.title} html={excerpt} themeId={beat.themeId} />
          )}
        </article>
      ))}
      <p className="story-more">
        <a href="/works">全部精品模板</a>
        <a href="/studio.html">用这篇去工作台</a>
      </p>
    </section>
  );
}
