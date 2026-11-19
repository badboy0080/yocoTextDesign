"use client";

import { useEffect, useState } from "react";

type SiteTheme = "day" | "night";

function readTheme(): SiteTheme {
  if (typeof document === "undefined") return "day";
  return document.documentElement.getAttribute("data-site") === "night" ? "night" : "day";
}

export function SiteThemeSwitch() {
  const [theme, setTheme] = useState<SiteTheme>("day");

  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-site"] });
    return () => observer.disconnect();
  }, []);

  function choose(next: SiteTheme) {
    const setSiteTheme = (window as Window & {
      __yoocoSetSiteTheme?: (theme: SiteTheme, persist: boolean) => void;
    }).__yoocoSetSiteTheme;
    setSiteTheme?.(next, true);
    setTheme(next);
  }

  return (
    <div className="site-theme-switch" role="group" aria-label="网站皮肤">
      <button type="button" data-site-value="day" aria-pressed={theme === "day"} onClick={() => choose("day")}>白天</button>
      <button type="button" data-site-value="night" aria-pressed={theme === "night"} onClick={() => choose("night")}>黑夜</button>
    </div>
  );
}
