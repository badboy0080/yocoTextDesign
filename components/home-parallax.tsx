"use client";

import { useEffect, type CSSProperties } from "react";

export function shiftStyle(depth: number): CSSProperties {
  return { "--depth": depth } as CSSProperties;
}

export function useHomeParallax() {
  useEffect(() => {
    const root = document.querySelector(".ol-home");
    if (!(root instanceof HTMLElement)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const apply = () => {
      frame = 0;
      const layers = root.querySelectorAll<HTMLElement>("[data-parallax]");
      if (reduce.matches) {
        root.style.removeProperty("--scroll");
        layers.forEach((node) => node.style.removeProperty("--p"));
        return;
      }
      root.style.setProperty("--scroll", String(window.scrollY || 0));
      const vh = window.innerHeight || 1;
      layers.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const progress = (vh * 0.5 - center) / vh;
        node.style.setProperty("--p", progress.toFixed(4));
      });
    };

    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    reduce.addEventListener("change", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      reduce.removeEventListener("change", request);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}
