"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const ENGLISH = "Make a good article worth reading to the end.";
const LAYOUTS = [
  { id: "serif-center", name: "中文书刊" },
  { id: "sans-offset", name: "中文海报" },
  { id: "bilingual-note", name: "双语编辑" },
  { id: "english-serif", name: "英文衬线" },
  { id: "english-poster", name: "英文海报" },
  { id: "bilingual-rule", name: "中英对照" },
] as const;

export function HeroTypeMorph() {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const layout = LAYOUTS[index];
  const english = layout.id.startsWith("english");
  const bilingual = layout.id.startsWith("bilingual");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const input = document.getElementById("home-article-input");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timeline: gsap.core.Timeline | null = null;
    const targets = root.querySelectorAll(".hero-line, .hero-sub");
    const sync = () => {
      if (timeline && document.activeElement === input && (timeline.time() < timeline.labels.readable || timeline.time() > timeline.labels.leaving)) {
        timeline.seek("readable", true);
      }
      timeline?.paused(document.hidden || document.activeElement === input);
    };
    const build = () => {
      timeline?.kill();
      gsap.set(targets, { clearProps: "transform,opacity,visibility" });
      if (media.matches) { timeline = null; return; }
      timeline = gsap.timeline({ onComplete: () => setIndex((value) => (value + 1) % LAYOUTS.length) });
      timeline.fromTo(targets,
        { y: 28, x: layout.id === "sans-offset" ? -18 : 0, autoAlpha: 0 },
        { y: 0, x: 0, autoAlpha: 1, duration: .7, stagger: .1, ease: "power3.out" })
        .addLabel("readable")
        .to({}, { duration: 5 })
        .addLabel("leaving")
        .to(targets, { y: -12, autoAlpha: 0, duration: .3, stagger: .025, ease: "power2.in" });
      sync();
    };
    build();
    input?.addEventListener("focus", sync);
    input?.addEventListener("blur", sync);
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", build);
    return () => {
      timeline?.kill();
      gsap.set(targets, { clearProps: "transform,opacity,visibility" });
      input?.removeEventListener("focus", sync);
      input?.removeEventListener("blur", sync);
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", build);
    };
  }, [index, layout.id]);

  return (
    <div className="hero-morph" ref={rootRef}>
      <h1 className="sr-only">把一篇好文章，排成读者愿意读完的样子</h1>
      <div className="hero-copy" data-style={layout.id} aria-hidden="true" key={layout.id}>
        <p className="hero-morph-label"><span>0{index + 1} / 06</span> {layout.name}</p>
        <div className="hero-title" lang={english ? "en" : "zh-CN"}>
          {english ? <>
            <span className="hero-line">Make a good article</span>
            <span className="hero-line">worth <em>reading</em></span>
            <span className="hero-line hero-line-last">to the end.</span>
          </> : <>
            <span className="hero-line">把一篇好文章，</span>
            <span className="hero-line">排成读者</span>
            <span className="hero-line hero-line-last">愿意读完的样子</span>
          </>}
        </div>
        <p className="hero-sub" lang={bilingual ? "en" : "zh-CN"}>{bilingual ? ENGLISH : "粘贴文章，优化排版"}</p>
      </div>
    </div>
  );
}
