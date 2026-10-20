"use client";

import { useState } from "react";
import { WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal } from "@/components/work-modal";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import "@/app/works.css";

const PICKS = WORKS.slice(0, 5);

export function WorksRail() {
  const [open, setOpen] = useState<WorkPiece | null>(null);
  const [origin, setOrigin] = useState<HTMLButtonElement | null>(null);
  const images = WORKS.map((work) => ({
    src: `/works/covers/${work.id}.png`,
    alt: `${work.title}，${work.themeLabel}`,
  }));

  return (
    <section className="works-band" aria-labelledby="works-heading">
      <div className="yooco-shell">
        <div className="works-head works-head-fan">
          <h2 id="works-heading">没有创意？试试下方的版式</h2>
          <a className="works-more" href="/works">全部精品模板 ↗</a>
        </div>
        <TiltedGridHero
          aria-hidden="true"
          className="works-tilt pointer-events-none"
          images={images}
          tileHeight={11}
          speed={5}
        />
        <ul className="works-picks">
          {PICKS.map((work) => (
            <li key={work.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(event) => {
                  setOrigin(event.currentTarget);
                  setOpen(work);
                }}
              >
                <strong>{work.title}</strong>
                <em style={{ color: work.primary }}>{work.themeLabel}</em>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {open ? <WorkModal work={open} origin={origin} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
