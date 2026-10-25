"use client";

import { useState } from "react";
import { GEM_THEME_IDS, WORKS, type WorkPiece } from "@/lib/works";
import { WorkModal, WorkPreview } from "@/components/work-modal";
import "@/app/works.css";

/** 预览按卡片宽度铺开，左右留 10px。装不下的正文由卡片裁掉，不再整篇缩小。 */
function CardPreview({ work }: { work: WorkPiece }) {
  return (
    <span className="works-marquee-frame" style={{ background: work.pageColor }}>
      <span className="works-marquee-fit">
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
      <CardPreview work={work} />
    </button>
  );
}

const HOME_WORKS = GEM_THEME_IDS.map((id) => WORKS.find((work) => work.themeId === id)).filter((work): work is WorkPiece => Boolean(work));

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
                {HOME_WORKS.map((work) => (
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
