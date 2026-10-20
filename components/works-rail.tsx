"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal, WorkPreview } from "@/components/work-modal";
import "@/app/works.css";

function FitPreview({ work }: { work: WorkPiece }) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const sheetRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    if (!frame || !sheet) return;

    const measure = () => {
      const page = sheet.querySelector(".work-sheet");
      if (!(page instanceof HTMLElement)) return;
      const width = page.offsetWidth;
      const height = page.offsetHeight;
      const frameWidth = frame.clientWidth;
      const frameHeight = frame.clientHeight;
      if (!width || !height || !frameWidth || !frameHeight) return;
      const next = Math.min(frameWidth / width, frameHeight / height);
      setScale(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [work.id]);

  return (
    <span ref={frameRef} className="works-marquee-frame" style={{ background: work.pageColor }}>
      <span
        ref={sheetRef}
        className="works-marquee-fit"
        style={{
          transform: `translate(-50%, -50%) scale(${scale || 0})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <WorkPreview work={work} />
      </span>
    </span>
  );
}

function MarqueeCard({
  work,
  clone,
  onOpen,
}: {
  work: WorkPiece;
  clone: boolean;
  onOpen: (work: WorkPiece, origin: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className="works-marquee-card"
      aria-haspopup="dialog"
      aria-label={`${work.title}，${work.themeLabel}`}
      aria-hidden={clone ? true : undefined}
      tabIndex={clone ? -1 : undefined}
      onClick={(event) => onOpen(work, event.currentTarget)}
    >
      <FitPreview work={work} />
    </button>
  );
}

export function WorksRail() {
  const [open, setOpen] = useState<WorkPiece | null>(null);
  const [origin, setOrigin] = useState<HTMLButtonElement | null>(null);

  function onOpen(work: WorkPiece, button: HTMLButtonElement) {
    setOrigin(button);
    setOpen(work);
  }

  return (
    <section className="works-band" aria-labelledby="works-heading">
      <div className="yooco-shell">
        <div className="works-head works-head-fan">
          <h2 id="works-heading">没有创意？试试下方的版式</h2>
          <a className="works-more" href="/works">全部精品模板 ↗</a>
        </div>
        <div className="works-marquee">
          <div className="works-marquee-track">
            {[false, true].map((clone) => (
              <div key={clone ? "clone" : "live"} className="works-marquee-group" aria-hidden={clone ? true : undefined}>
                {WORKS.map((work) => (
                  <MarqueeCard key={work.id} work={work} clone={clone} onOpen={onOpen} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {open ? <WorkModal work={open} origin={origin} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
