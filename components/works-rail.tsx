"use client";

import { useState, type CSSProperties } from "react";
import { WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal, WorkPreview } from "@/components/work-modal";
import "@/app/works.css";

const TILTS = [-14, -7, 0, 7, 14];

export function WorksRail() {
  const [open, setOpen] = useState<WorkPiece | null>(null);
  const [origin, setOrigin] = useState<HTMLButtonElement | null>(null);

  return (
    <section className="works-band" aria-labelledby="works-heading">
      <div className="yooco-shell">
        <div className="works-head works-head-fan">
          <h2 id="works-heading">没有创意？试试下方的版式</h2>
          <a className="works-more" href="/works">全部作品 ↗</a>
        </div>
        <div className="works-fan" aria-label="版式示例">
          {WORKS.slice(0, 5).map((work, index) => (
            <button
              key={work.id}
              type="button"
              className="work-card"
              style={{ "--tilt": `${TILTS[index]}deg` } as CSSProperties}
              aria-haspopup="dialog"
              onClick={(event) => {
                setOrigin(event.currentTarget);
                setOpen(work);
              }}
            >
              <span className="work-cover" style={{ background: work.pageColor }}>
                <WorkPreview work={work} />
              </span>
              <span className="work-card-copy">
                <strong>{work.title}</strong>
                <em style={{ color: work.primary }}>{work.themeLabel}</em>
              </span>
            </button>
          ))}
        </div>
      </div>
      {open ? <WorkModal work={open} origin={origin} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
