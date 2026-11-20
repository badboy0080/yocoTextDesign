"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
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
    article.appendChild(heading);
    article.appendChild(body);
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

function useBookTilt(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const book = ref.current;
    if (!book) return;
    const node = book;
    const view = window;
    const reduce = view.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = view.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches || !fine.matches) return;
    const restX = -7;
    const restY = 4;
    const max = 4;
    let tx = restX;
    let ty = restY;
    let cx = restX;
    let cy = restY;
    let frame = 0;
    function paint() {
      frame = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      node.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.04 || Math.abs(ty - cy) > 0.04) frame = view.requestAnimationFrame(paint);
    }
    function kick() {
      if (!frame) frame = view.requestAnimationFrame(paint);
    }
    function move(event: PointerEvent) {
      const box = node.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      const py = (event.clientY - box.top) / box.height - 0.5;
      tx = restX + px * max * 2;
      ty = restY - py * max;
      kick();
    }
    function leave() {
      tx = restX;
      ty = restY;
      kick();
    }
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      if (frame) view.cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [ref]);
}

export function HomeHeroBook({ sample }: { sample: SampleTry }) {
  const pieces = excerptPieces(sample.html);
  const excerpt = pieces.map((piece) => piece.html).join("");
  const tiltRef = useRef<HTMLDivElement>(null);
  useBookTilt(tiltRef);

  return (
    <div className="ol-hero-book">
      <div className="ol-hero-book-tilt" ref={tiltRef}>
        <div className="ol-hero-page">
          <ThemeSheet title={sample.title} html={excerpt} themeId="fresh" />
        </div>
      </div>
    </div>
  );
}

function beatShows(progress: number) {
  const hold = 0.18;
  const glide = 0.16;
  const cuts = [hold, hold + glide, hold + glide + hold, hold + glide + hold + glide];
  const shows = [1, 0, 0];
  if (progress < cuts[0]) return shows;
  if (progress < cuts[1]) {
    shows[1] = (progress - cuts[0]) / glide;
    return shows;
  }
  shows[1] = 1;
  if (progress < cuts[2]) return shows;
  if (progress < cuts[3]) {
    shows[2] = (progress - cuts[2]) / glide;
    return shows;
  }
  shows[2] = 1;
  return shows;
}

export function HomeStory({ sample }: { sample: SampleTry }) {
  const pieces = excerptPieces(sample.html);
  const excerpt = pieces.map((piece) => piece.html).join("");
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const node = pin;
    const view = window;
    const root = document.documentElement;
    const wide = view.matchMedia("(min-width: 961px)");
    const reduce = view.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function apply(progress: number) {
      const beats = [...node.querySelectorAll<HTMLElement>(".story-beat")];
      const shows = beatShows(progress);
      beats.forEach((beat, index) => {
        const show = shows[index] ?? 0;
        const next = shows[index + 1] ?? 0;
        const fadeOut = next <= 0.08 ? 1 : next >= 0.42 ? 0 : 1 - (next - 0.08) / 0.34;
        const fadeIn = show <= 0.55 ? 0 : show >= 0.92 ? 1 : (show - 0.55) / 0.37;
        const fade = Math.max(0, Math.min(1, fadeOut, fadeIn));
        beat.style.setProperty("--show", show.toFixed(3));
        beat.style.setProperty("--fade", fade.toFixed(3));
        beat.style.setProperty("--drift", next.toFixed(3));
        beat.style.visibility = next > 0.98 ? "hidden" : "visible";
        beat.classList.toggle("is-front", fade > 0.45);
      });
    }

    function update() {
      frame = 0;
      const on = wide.matches && !reduce.matches;
      root.classList.toggle("yooco-pin", on);
      if (!on) {
        node.querySelectorAll<HTMLElement>(".story-beat").forEach((beat) => {
          beat.style.removeProperty("--show");
          beat.style.removeProperty("--fade");
          beat.style.removeProperty("--drift");
          beat.style.removeProperty("visibility");
          beat.classList.remove("is-front");
        });
        return;
      }
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, node.offsetHeight - view.innerHeight);
      const progress = Math.min(1, Math.max(0, (76 - rect.top) / travel));
      apply(progress);
    }

    function schedule() {
      if (frame) return;
      frame = view.requestAnimationFrame(update);
    }

    update();
    wide.addEventListener("change", update);
    reduce.addEventListener("change", update);
    view.addEventListener("scroll", schedule, { passive: true });
    view.addEventListener("resize", schedule);
    return () => {
      if (frame) view.cancelAnimationFrame(frame);
      wide.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
      view.removeEventListener("scroll", schedule);
      view.removeEventListener("resize", schedule);
      root.classList.remove("yooco-pin");
    };
  }, []);

  return (
    <section className="ol-story" id="works-heading" aria-labelledby="home-story-title">
      <div className="story-intro">
        <h2 id="home-story-title">同一篇，从原稿到换皮肤</h2>
        <p>往下是工作台示例《{sample.title}》。先看密排原文，再展开成清氧绿成稿，然后只换皮成深空青。字是同一篇，没有另编客户和数字。</p>
      </div>
      <div className="story-pin" ref={pinRef}>
        <div className="story-stage">
          {SHOWCASE_BEATS.map((beat) => (
            <article className="story-beat" id={`story-${beat.id}`} key={beat.id} aria-labelledby={`story-${beat.id}-title`}>
              <div className="story-copy">
                <p className="story-kicker">{beat.kicker}</p>
                <h3 id={`story-${beat.id}-title`}>{beat.title}</h3>
              </div>
              <div className="story-sheet">
                {beat.kind === "manuscript" ? (
                  <div className="story-manuscript">
                    {pieces.map((piece) => (
                      <p key={piece.index}>{piece.text}</p>
                    ))}
                  </div>
                ) : (
                  <ThemeSheet title={sample.title} html={excerpt} themeId={beat.themeId} />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <p className="story-more">
        <a href="/works">全部精品模板</a>
        <a href="/studio.html">用这篇去工作台</a>
      </p>
    </section>
  );
}
