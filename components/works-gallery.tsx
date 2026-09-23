"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal, WorkPreview } from "@/components/work-modal";

export function WorksGallery() {
  const [open, setOpen] = useState<WorkPiece | null>(null);
  const [filter, setFilter] = useState("全部");
  const [origin, setOrigin] = useState<HTMLButtonElement | null>(null);
  const grid = useRef<HTMLUListElement>(null);
  const filters = ["全部", ...new Set(WORKS.map((work) => work.themeLabel))];
  const visible = WORKS.filter((work) => filter === "全部" || work.themeLabel === filter);
  useLayoutEffect(() => {
    if (!grid.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(".works-grid > li", { y: 22, opacity: 0, duration: 0.45, stagger: 0.055, ease: "power2.out", clearProps: "transform,opacity" });
    }, grid.current.parentElement!);
    return () => context.revert();
  }, [filter]);

  return (
    <div className="works-page">
      <header className="works-page-bar">
        <p className="works-eyebrow">THE EDIT / 排版作品集</p>
        <h1>让好内容，<br />有好看的样子。</h1>
        <p className="works-intro">挑一套喜欢的排版，打开阅读，或用它开始你的下一篇。</p>
      </header>
      <div className="works-filter-bar">
        <div className="works-filters" role="group" aria-label="按排版风格筛选">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <span className="works-count" aria-live="polite">{visible.length} 件作品</span>
      </div>
      <ul className="works-grid" ref={grid}>
        {visible.map((work) => (
          <li key={work.id}>
            <button type="button" className="work-card work-card-static" aria-haspopup="dialog" onClick={(event) => { setOrigin(event.currentTarget); setOpen(work); }}>
              <span className="work-cover" style={{ background: work.pageColor }}>
                <WorkPreview work={work} />
              </span>
              <span className="work-card-copy">
                <strong>{work.title}</strong>
                <em style={{ color: work.primary }}>{work.themeLabel}</em>
                <span className="work-fit">{work.fit}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open ? <WorkModal work={open} origin={origin} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
