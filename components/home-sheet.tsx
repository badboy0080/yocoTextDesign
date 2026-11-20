"use client";

import { useEffect, useRef, useState } from "react";
import type { Plate, Specimen } from "@/lib/home-specimens";

export function SpecimenSheet({ specimen, compact }: { specimen: Specimen; compact?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const theme = specimen.theme;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    root.innerHTML = "";
    let cancelled = false;
    const style = document.createElement("style");
    style.textContent = ":host{display:block}.article-page{max-width:100%;box-sizing:border-box;background:var(--page-color,#fff)}.article-content,.article-page h2{overflow-wrap:anywhere}.specimen-byline{margin:8px 0 0;color:var(--muted-color,#9ca3af);font-size:12px;letter-spacing:.04em}";
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
    heading.textContent = specimen.work;
    const body = document.createElement("div");
    body.className = "article-content";
    body.innerHTML = specimen.html;
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
  }, [specimen, theme]);

  return (
    <div className={compact ? "bk-sheet is-compact" : "bk-sheet"} data-live={live ? "1" : "0"}>
      <article className="bk-fallback" style={{ background: theme.pageColor, color: theme.textColor }}>
        <h3 style={{ color: theme.pageColor === "#1a1a1a" ? "#f3f4f6" : "#211A12" }}>{specimen.work}</h3>
        <div dangerouslySetInnerHTML={{ __html: specimen.html }} />
      </article>
      <div ref={hostRef} className="bk-host" />
    </div>
  );
}

export function PlatePage({ plate }: { plate: Plate }) {
  return (
    <figure className="bk-art">
      <img src={plate.src} alt={plate.alt} style={{ objectPosition: plate.position, transform: plate.zoom ? `scale(${plate.zoom})` : undefined, transformOrigin: "center bottom" }} />
      <figcaption>{plate.credit}</figcaption>
    </figure>
  );
}
