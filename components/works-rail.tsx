"use client";

import { useEffect, useRef, useState } from "react";
import { WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal, WorkPreview } from "@/components/work-modal";
import "@/app/works.css";

export function WorksRail() {
  const [open, setOpen] = useState<WorkPiece | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<HTMLButtonElement | null>(null);
  const dragged = useRef(false);
  const pointer = useRef<{ id: number; x: number; left: number } | null>(null);
  const loop = [...WORKS, ...WORKS];

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let remainder = 0;
    let touching = false;
    const touchStart = () => { touching = true; };
    const touchEnd = () => { touching = false; };
    node.addEventListener("touchstart", touchStart, { passive: true });
    node.addEventListener("touchend", touchEnd, { passive: true });
    node.addEventListener("touchcancel", touchEnd, { passive: true });
    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 50) : 0;
      last = now;
      if (!open && !reduced.matches && !document.hidden && !touching && !pointer.current && !node.matches(":hover") && !node.contains(document.activeElement)) {
        remainder += elapsed * 0.024;
        const pixels = Math.floor(remainder);
        remainder -= pixels;
        node.scrollLeft += pixels;
        const repeat = node.querySelector<HTMLElement>('[data-repeat="true"]');
        const first = node.querySelector<HTMLElement>(".work-card");
        const span = repeat && first ? repeat.offsetLeft - first.offsetLeft : 0;
        if (span > 0 && node.scrollLeft >= span) node.scrollLeft -= span;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("touchstart", touchStart);
      node.removeEventListener("touchend", touchEnd);
      node.removeEventListener("touchcancel", touchEnd);
    };
  }, [open]);

  return (
    <section className="works-band" aria-labelledby="works-heading">
      <div className="yooco-shell">
        <div className="works-head">
          <div>
            <p className="works-eyebrow">SELECTED WORK / 精选排版</p>
            <h2 id="works-heading">好文章的另一种样子。</h2>
            <p>打开看看，再把喜欢的排版变成你的。</p>
          </div>
          <a className="works-more" href="/works">全部作品 ↗</a>
        </div>
        <div className="works-viewport" ref={viewport}
          onPointerDown={(event) => {
            dragged.current = false;
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            pointer.current = { id: event.pointerId, x: event.clientX, left: event.currentTarget.scrollLeft };
          }}
          onPointerMove={(event) => {
            const start = pointer.current;
            if (!start) return;
            const distance = event.clientX - start.x;
            if (Math.abs(distance) > 6) {
              dragged.current = true;
              if (!event.currentTarget.hasPointerCapture(start.id)) event.currentTarget.setPointerCapture(start.id);
              event.currentTarget.scrollLeft = start.left - distance;
            }
          }}
          onPointerUp={(event) => {
            const start = pointer.current;
            if (start && event.currentTarget.hasPointerCapture(start.id)) event.currentTarget.releasePointerCapture(start.id);
            pointer.current = null;
          }}
          onPointerCancel={() => { pointer.current = null; }}
          onPointerLeave={() => { if (!dragged.current) pointer.current = null; }}
          onClickCapture={(event) => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}
        >
          <div className="works-track">
            {loop.map((work, index) => (
              <button key={`${work.id}-${index}`} type="button" className="work-card" aria-haspopup="dialog"
                data-repeat={index === WORKS.length ? "true" : undefined}
                tabIndex={index >= WORKS.length ? -1 : 0} aria-hidden={index >= WORKS.length ? true : undefined}
                onClick={(event) => { setOrigin(event.currentTarget); setOpen(work); }}>
                <span className="work-cover" style={{ background: work.pageColor }}><WorkPreview work={work} /></span>
                <span className="work-card-copy"><strong>{work.title}</strong><em style={{ color: work.primary }}>{work.themeLabel}</em></span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {open ? <WorkModal work={open} origin={origin} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
