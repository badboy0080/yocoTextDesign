"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { applyWork, downloadWorkConfig, type WorkPiece } from "@/lib/works";

export function WorkPreview({ work }: { work: WorkPiece }) {
  return (
    <article className={`work-sheet work-sheet--${work.sheet}`} style={{ background: work.pageColor, color: work.textColor }}>
      <header className="work-sheet-header">
        <div className="work-sheet-meta"><span>YOOCO / TEMPLATE</span><span>{work.themeLabel} · {work.sheetNo}</span></div>
        {work.sheet === "serene" && <div className="work-sheet-landscape" aria-hidden="true"><i /><b /><em /></div>}
        {work.sheet === "mono" && <span className="work-sheet-vertical" aria-hidden="true">SPACE / FORM / RHYTHM</span>}
        {work.sheet === "stub" && <span className="work-sheet-ticket-label">FIELD CHECKLIST <span>№ {work.sheetNo}</span></span>}
        {work.sheet === "editorial" && <span className="work-sheet-issue">ISSUE {work.sheetNo} <span>EDITOR&apos;S NOTE</span></span>}
        {work.sheet === "magazine" && <span className="work-sheet-issue work-sheet-issue--green">{work.sheetNo} <span>CONTENTS</span></span>}
        {work.sheet === "lively" && <span className="work-sheet-pill">周末清单</span>}
        {work.sheet === "deep" && <span className="work-sheet-signal">SIGNAL / {work.sheetNo}</span>}
        {work.sheet === "nocturne" && <span className="work-sheet-night">结论</span>}
        {work.sheet === "minimal" && <span className="work-sheet-rule">{work.sheetNo} — QUIET</span>}
        <h3 style={{ color: work.titleColor }}>{work.title}</h3>
        <p className="work-sheet-deck">{work.fit} <span>／</span> {work.deck}</p>
      </header>
      <div className="work-sheet-content">{work.blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h4 key={index} style={{ color: work.titleColor }}>
              {block.text}
            </h4>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={index} style={{ borderColor: work.accentColor }}>
              {block.text}
            </blockquote>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "p") return <p key={index} className={index === 0 ? "work-sheet-lead" : undefined}>{block.text}</p>;
        return null;
      })}</div>
      <footer className="work-sheet-end">YOOCO <span>·</span> FIN.</footer>
    </article>
  );
}

export function WorkModal({
  work,
  onClose,
  origin,
}: {
  work: WorkPiece;
  onClose: () => void;
  origin: HTMLButtonElement | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<() => void>(() => {});
  const callbackRef = useRef(onClose);
  useLayoutEffect(() => { callbackRef.current = onClose; });

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const dialog = dialogRef.current;
    if (!overlay || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const siblings = Array.from(document.body.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== overlay);
    const inertStates = siblings.map((node) => node.inert);
    siblings.forEach((node) => { node.inert = true; });
    document.body.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let closing = false;
    const geometry = () => {
      const target = origin?.getBoundingClientRect();
      const rect = dialog.getBoundingClientRect();
      if (!target || target.bottom < 0 || target.top > window.innerHeight) return { y: 16, x: 0, scaleX: 0.98, scaleY: 0.98 };
      return { x: target.left + target.width / 2 - (rect.left + rect.width / 2), y: target.top + target.height / 2 - (rect.top + rect.height / 2), scaleX: target.width / rect.width, scaleY: target.height / rect.height };
    };
    const start = geometry();
    const context = gsap.context(() => {
      gsap.from(overlay, { backgroundColor: "rgba(17,17,17,0)", duration: reduced.matches ? 0 : 0.4 });
      gsap.from(dialog, { ...start, opacity: 0, duration: reduced.matches ? 0 : 0.55, ease: "power3.inOut", clearProps: "transform,opacity" });
    }, overlay);
    closeRef.current = () => {
      if (closing) return;
      closing = true;
      gsap.killTweensOf([overlay, dialog]);
      gsap.set(dialog, { clearProps: "transform" });
      const finish = geometry();
      gsap.to(overlay, { backgroundColor: "rgba(17,17,17,0)", duration: reduced.matches ? 0 : 0.3 });
      gsap.to(dialog, { ...finish, opacity: 0, duration: reduced.matches ? 0 : 0.35, ease: "power3.inOut", onComplete: () => callbackRef.current() });
    };
    dialog.querySelector<HTMLButtonElement>(".work-close")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); }
      if (event.key === "Tab") {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex="0"]'));
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      gsap.killTweensOf([overlay, dialog]);
      context.revert();
      document.body.style.overflow = previousOverflow;
      siblings.forEach((node, index) => { node.inert = inertStates[index]; });
      (origin?.isConnected ? origin : previousFocus)?.focus({ preventScroll: true });
    };
  }, [origin]);

  return createPortal(
    <div ref={overlayRef} className="work-modal" role="presentation" onClick={() => closeRef.current()}>
      <div
        ref={dialogRef}
        className="work-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="work-dialog-body">
          <div className="work-source-compare">
            <section className="work-source-col" aria-labelledby="work-source-label">
              <p id="work-source-label" className="work-source-label">原文</p>
              <div className="work-source-scroll" tabIndex={0}>
                {work.plain?.trim() ? (
                  <pre className="work-plain">{work.plain}</pre>
                ) : (
                  <p className="work-plain work-plain-empty">这套模板还没有配套原文。</p>
                )}
              </div>
            </section>
            <section className="work-source-col" aria-labelledby="work-result-label">
              <p id="work-result-label" className="work-source-label">排版后</p>
              <div className="work-source-scroll" tabIndex={0}>
                <WorkPreview work={work} />
              </div>
            </section>
          </div>
        </div>
        <aside className="work-dialog-info">
        <header className="work-dialog-bar">
          <div>
            <p className="work-kicker" style={{ color: work.primary }}>
              {work.themeLabel}
            </p>
            <h2 id="work-dialog-title">{work.title}</h2>
          </div>
          <button type="button" className="work-close" onClick={() => closeRef.current()} aria-label="关闭精品模板预览">
            X
          </button>
        </header>
        <p className="work-description">{work.fit}</p>
        <p className="work-detail-note">从这套排版开始，换上你的文章，再调整成自己的样子。</p>
        <div className="work-swatches" aria-label="模板配色">{[work.pageColor, work.titleColor, work.accentColor].map((color, index) => <span key={index} style={{ background: color }} />)}</div>
        <footer className="work-dialog-actions">
          <button type="button" className="work-btn work-btn-primary" onClick={() => applyWork(work)}>
            做同款
          </button>
          <button type="button" className="work-btn" onClick={() => downloadWorkConfig(work)}>
            下载此排版配置
          </button>
        </footer>
        </aside>
      </div>
    </div>, document.body
  );
}
